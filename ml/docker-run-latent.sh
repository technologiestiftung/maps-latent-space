#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

NAME="latent"
REPO="technologiestiftung/maps-latent-space"
TAG="latest"
PWD=$(pwd)
INTERACTIVE=

print_usage() {
   printf "\n\nUsage:------------------------------\n"
   printf "Usage: %s -t <yourtag> -n <containername> -r <org/project>\n" "${0}"
   printf "       If -t (Tag) flag is not specified it will use '%s'\n" $TAG
   printf "       If -n (Name) flag is not specified it will use '%s'\n" $NAME
   printf "       If -r (Repo) flag is not specified it will use '%s'\n" $REPO

 }

while getopts "n:t:r:ih" flag; do
  case "${flag}" in
    t) TAG="${OPTARG}" ;;
    n) NAME="${OPTARG}" ;;
    r) REPO="${OPTARG}" ;;
    i) INTERACTIVE=1 ;;
    h) print_usage
    exit 1 ;;
    *) print_usage
    exit 1 ;;
  esac
done
shift $(( OPTIND-1 ))

printf "\t running with docker run --name %s %s:%s\n" $NAME $REPO $TAG
# echo $TAG
# echo $NAME
# echo $REPO

if [ ! "$(docker ps -q -f name=$NAME)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=$NAME)" ]; then
        # cleanup
        docker rm "${NAME}"
    fi
    # run your container
      if [ ! -z "$INTERACTIVE" ]; then
        docker run -p 9999:9999 -it --name "${NAME}" --gpus all  -v "${PWD}/out":/workdir/out "${REPO}:${TAG}"
      else
      docker run -p 9999:9999 --name "${NAME}" --gpus all  -v "${PWD}/out":/workdir/out "${REPO}:${TAG}"
    fi
fi
