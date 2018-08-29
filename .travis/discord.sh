#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-t <string>] [-d <string>] [-c <error|info|*>]" 1>&2; exit 1; }

# Parse Options
while getopts ":t:d:c" o; do
    case "${o}" in
        t)
            title=${OPTARG}
            ;;
        d)
            description=${OPTARG}
            ;;
        c)
            case "${OPTARG}" in
              "error")
                  color="0xE8341C"
                  ;;
              "info")
                  color="0x68C244"
                  ;;
              *)
                  color="0xF2D42C"
                  ;;
            esac
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${title}" ] || [ -z "${description}" ] || [ -z "${color}" ]; then
    usage
fi

# data = "{\"content\":\"SUCCESS: TEST Version $TRAVIS_TAG failed!\"}" 
data="{\"embeds\": [{\"title\": \"${title}\",\"description\": \"${description}\",\"color\": \"${color}\",}]}"


curl -H 'Content-Type: application/json'  -X POST -d "${data}" ${DISCORD_WEBHOOK}