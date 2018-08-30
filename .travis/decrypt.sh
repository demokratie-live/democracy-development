#!/bin/bash

# Environment Variables
openssl aes-256-cbc -k "$SECRET" -in ./.env.travis.enc -out ./.env.travis -d

# SSH Key for Digital Ocean
openssl aes-256-cbc -k "$SECRET" -in ./ssh_key.enc -out ./ssh_key -d
openssl aes-256-cbc -k "$SECRET" -in ./ssh_key.pub.enc -out ./ssh_key.pub -d

# Server .env
openssl aes-256-cbc -k "$SECRET" -in ./../server/.env.enc -out ./../server/.env -d
# Bundestag.io .env
openssl aes-256-cbc -k "$SECRET" -in ./../bundestag.io/.env.enc -out ./../bundestag.io/.env -d

# Client Store Credentials
openssl aes-256-cbc -k "$SECRET" -in ./../client/android/Google_Play_Android_Developer.json.enc -out ./../client/android/Google_Play_Android_Developer.json -d
openssl aes-256-cbc -k "$SECRET" -in ./../client/android/app/democracy2-release-key.keystore.enc -out ./../client/android/app/democracy2-release-key.keystore -d  
# Client .env's
openssl aes-256-cbc -k "$SECRET" -in ./../client/.env.internal.enc -out ./../client/.env.internal -d
openssl aes-256-cbc -k "$SECRET" -in ./../client/.env.alpha.enc -out ./../client/.env.alpha -d
openssl aes-256-cbc -k "$SECRET" -in ./../client/.env.beta.enc -out ./../client/.env.beta -d
openssl aes-256-cbc -k "$SECRET" -in ./../client/.env.production.enc -out ./../client/.env.production -d