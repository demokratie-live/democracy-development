#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-title <string>] [-description <string>] [-color <error|info|*>]" 1>&2; exit 1; }

# Parse Options
while getopts ":title:description:color" o; do
    case "${o}" in
        title)
            title=${OPTARG}
            ;;
        description)
            description=${OPTARG}
            ;;
        color)
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
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${title}" ] || [ -z "${description}" ]; then
    usage
fi

# data = "{\"content\":\"SUCCESS: TEST Version $TRAVIS_TAG failed!\"}" 
data="{\"embeds\": [{
				\"title\": \"${title}\",
				\"description\": \"${description}\",
				\"color\": \"${color}\",
			}]}"


curl -H 'Content-Type: application/json'  -X POST -d ${data} ${DISCORD_WEBHOOK}