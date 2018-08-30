#!/bin/bash

openssl aes-256-cbc -k "$SECRET" -in ./../.env/.env.travis -out ./../.env/.env.travis.enc