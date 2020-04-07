#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

cat << EOF >> ~/.vimrc
syntax on
set autoindent
set backspace=2
set cursorline
set expandtab
set hlsearch
set ignorecase
set incsearch
set linebreak
set list
set listchars=space:·
set noerrorbells
set number
set ruler
set shiftwidth=2
set showbreak=+++
set showmatch
set smartcase
set smartindent
set smarttab
set softtabstop=2
set tabstop=2
set termguicolors
set textwidth=100
set visualbell
EOF

sudo apt-get update -y
echo 'CUDA_VISIBLE_DEVICES=-1' >> ~/.profile
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
cat << EOF >> ~/.profile
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
EOF
# shellcheck disable=SC1091
source "/home/ubuntu/.profile"
nvm install lts/erbium
# nvm alias default lts/erbium
npm install pm2 -g || ech0 'could not install pm2 globally'
sudo apt install git tmux zsh nginx docker.io -y
cd /home/ubuntu
git clone https://github.com/technologiestiftung/maps-latent-space.git
cd ./maps-latent-space/server
npm ci
npm run build
cd  ..
