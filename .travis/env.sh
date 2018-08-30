#!/bin/bash

set -o allexport
source ./.travis/.env.travis
DISCORD_WEBHOOK=${DISCORD_WEBHOOK%$'\r'}
set +o allexport