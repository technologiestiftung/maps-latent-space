#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

NAME="latent"

print_usage() {
   printf "\n\nUsage:------------------------------\n"
   printf "Usage: %s -n <containername>\n" "${0}"
   printf "       If -n (Name) flag is not specified it will use '%s'\n" $NAME
 }

while getopts "n:h" flag; do
  case "${flag}" in
    n) NAME="${OPTARG}" ;;
    h) print_usage
    exit 1 ;;
    *) print_usage
    exit 1 ;;
  esac
done
shift $(( OPTIND-1 ))

if [ "$(docker ps -q -f name=$NAME)" ]; then
  docker exec -it "${NAME}" /bin/bash
else
  printf "There is no container with the name '%s'\n" $NAME
fi
