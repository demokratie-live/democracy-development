#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-d <string>] [-l <string>]" 1>&2; exit 1; }

# Parse Options
while getopts ":d:l:" o; do
    case "${o}" in
        d)
            directory=${OPTARG}
            ;;
        l)
            lane=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${directory}" ] || [ -z "${lane}" ]; then
    usage
fi

cd client/${directory}
DELIVER_ITMSTRANSPORTER_ADDITIONAL_UPLOAD_PARAMETERS="-t DAV" bundle exec fastlane ${directory} ${lane}
cd ../../