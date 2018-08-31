#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-h <string>] [-d <string>] [-u <string>]" 1>&2; exit 1; }

# Parse Options
while getopts ":h:d:u:" o; do
    case "${o}" in
        h)
            host=${OPTARG}
            ;;
        d)
            dropplet=${OPTARG}
            ;;
        u)
            user=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${host}" ] || [ -z "${dropplet}" ] || [ -z "${user}" ]; then
    usage
fi

# build docker-compose
sudo docker-compose build
# build doctl
sudo docker build -t doctl --build-arg SSH_KEY="$(cat ./.travis/ssh_key)" --build-arg SSH_KEY_PUB="$(cat ./.travis/ssh_key.pub)" --build-arg HOST_IP="${host}" - < ./doctl
# run ssh command using doctl
sudo docker run --rm -e DIGITALOCEAN_ACCESS_TOKEN="${DIGITALOCEAN_ACCESS_TOKEN}" doctl compute ssh ${dropplet} --ssh-user ${user} --ssh-command "cd ~/democracy-development && ./deploy-production.sh $TRAVIS_TAG"