#!/bin/bash
echo "### Start git process ###"

echo "# git fetch --all #"
git fetch --all
echo "# git checkout tag/$@ #"
git checkout tags/$@
echo "# git submodule update --init --recursive #"
git submodule update --init --recursive
echo "# git status #"
git status

echo "### Start docker Process ###"
echo "# docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
echo "# docker system prune"
docker system prune
