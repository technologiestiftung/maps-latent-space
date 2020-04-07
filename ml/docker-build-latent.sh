#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
TAG="latest"
REPOSITORY="technologiestiftung/maps-latent-space"
DOCKERFILE="Dockerfile"
YES=false
print_usage() {
   printf "\n\nUsage:------------------------------\n"
   printf "Usage: %s -t yourtag\n -y" "${0}"

   printf "       If -f flag is not specified it will use default Dockerfile '%s'\n" $TAG
   printf "       If -t flag is not specified it will use '%s'\n" $TAG
   printf "       If -y flag is not specified it will use ask for confirmation\n"
 }

while getopts "hyt:f:" flag; do
  case "${flag}" in
   t) TAG="${OPTARG}"
      ;;
      f) DOCKERFILE="${OPTARG}"
            ;;
    y) YES=true ;;
    h) print_usage
        exit 1 ;;
    *) print_usage
        exit 1 ;;
  esac
  # shift
done

shift $(( OPTIND-1 ))

echo
printf "\tYour image will be build with this repository:tag\n"
printf "\t%s:%s\n" "${REPOSITORY}" "${TAG}"
printf "Using as Dockerfile %s" "${DOCKERFILE}"
echo
echo
if [[ $YES == true ]]; then
docker build -f "${DOCKERFILE}" --tag "${REPOSITORY}:${TAG}" . && exit
fi

while true; do
    read -rp "Do you want to proceed (y/n)? " yn
    case $yn in
        [Yy]* ) docker build -f "${DOCKERFILE}" --tag "${REPOSITORY}:${TAG}" . ; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

