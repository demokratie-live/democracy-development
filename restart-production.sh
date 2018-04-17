#!/bin/bash
echo "### Start docker Process ###"
echo "# docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build $@"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build $@
