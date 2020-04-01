#!/usr/bin/env bash

while getopts "f:" flag
do
     case $flag in
         f)
           echo "Hi"
           STARTPOINT=$OPTARG
           shift
           ;;
     esac
     shift
done