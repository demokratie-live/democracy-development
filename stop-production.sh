#!/bin/bash
echo "### Stop docker Process ###"
echo "# docker kill $(docker ps -q)"
docker kill $(docker ps -q)
