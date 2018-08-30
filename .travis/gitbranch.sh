#!/bin/bash

# Usage description
usage() { echo "Usage: $0 [-d <string>] [-b <string>]" 1>&2; exit 1; }

- cd client
    - COMMIT=$(git rev-parse HEAD)
    - BRANCHES=$(git branch -r --contains ${COMMIT})
    - ORIGINMASTER='origin/master'
    - if `echo ${BRANCHES} | grep "${ORIGINMASTER}" 1>/dev/null 2>&1`; then exit 0; else exit 1; fi