#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-d <string>] [-b <string>]" 1>&2; exit 1; }

# Parse Options
while getopts ":d:b:" o; do
    case "${o}" in
        d)
            directory=${OPTARG}
            ;;
        b)
            branch=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${directory}" ] || [ -z "${branch}" ]; then
    usage
fi

cd $directory

COMMIT=$(git rev-parse HEAD)
BRANCHES=$(git branch -r --contains ${COMMIT})

if `echo ${BRANCHES} | grep "${branch}" 1>/dev/null 2>&1`; then
  exit 0;
else
  cd -
  ./.travis/discord.sh -t "Failure $TRAVIS_TAG" -d "[Git] Deploy Build $BUILD_NUMBER on Tag $TRAVIS_TAG failed - $directory is not on $branch" -c error
  exit 1;
fi