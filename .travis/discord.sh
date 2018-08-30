#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-t <string>] [-d <string>] [-c <error|info|*>]" 1>&2; exit 1; }

# Parse Options
while getopts ":t:d:c:" o; do
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
                  color=15217692
                  ;;
              info)
                  color=6865476
                  ;;
              *)
                  color=15914028
                  ;;
            esac
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${title}" ] || [ -z "${description}" ]; then
    usage
fi

data="{ \"embeds\": [{\"title\": \"${title}\",\"description\": \"${description}\",\"color\": ${color}}]}"

curl -H 'Content-Type: application/json'  -X POST -d "${data}" ${DISCORD_WEBHOOK}