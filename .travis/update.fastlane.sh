#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-d <string>]" 1>&2; exit 1; }

# Parse Options
while getopts ":d:" o; do
    case "${o}" in
        d)
            directory=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${directory}" ]; then
    usage
fi

cd client/${directory}
gem update --system
bundle install
gem install fastlane --version 2.112.0
gem uninstall fastlane -v 2.113.0
cd ../../