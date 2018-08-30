#!/bin/bash

set -o allexport
source ./.travis/.env.travis
set +o allexport

echo $DISCORD_WEBHOOK