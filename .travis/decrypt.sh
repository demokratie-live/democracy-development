#!/bin/bash

# Environment Variables
openssl aes-256-cbc -k "$SECRET" -in ./.travis/.env.travis.enc -out ./.travis/.env.travis -d -md md5

# SSH Key for Digital Ocean
openssl aes-256-cbc -k "$SECRET" -in ./.travis/ssh_key.enc -out ./.travis/ssh_key -d -md md5
openssl aes-256-cbc -k "$SECRET" -in ./.travis/ssh_key.pub.enc -out ./.travis/ssh_key.pub -d -md md5

# democracy-app.de-api .env
openssl aes-256-cbc -k "$SECRET" -in ./democracy-app.de-api/.env.enc -out ./democracy-app.de-api/.env -d -md sha256
# democracy-app.de-admin .env
openssl aes-256-cbc -k "$SECRET" -in ./democracy-app.de-admin/.env.enc -out ./democracy-app.de-admin/.env -d -md sha256

# bundestag.io-api .env
openssl aes-256-cbc -k "$SECRET" -in ./bundestag.io-api/.env.enc -out ./bundestag.io-api/.env -d -md sha256
# bundestag.io-admin .env
openssl aes-256-cbc -k "$SECRET" -in ./bundestag.io-admin/.env.enc -out ./bundestag.io-admin/.env -d -md md5

# democracy-app.de .env
openssl aes-256-cbc -k "$SECRET" -in ./democracy-app.de/.env.enc -out ./democracy-app.de/.env -d -md md5

# Client Store Credentials
openssl aes-256-cbc -k "$SECRET" -in ./client/android/Google_Play_Android_Developer.json.enc -out ./client/android/Google_Play_Android_Developer.json -d -md md5
openssl aes-256-cbc -k "$SECRET" -in ./client/android/app/democracy2-release-key.keystore.enc -out ./client/android/app/democracy2-release-key.keystore -d -md md5 
# Client .env's
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.internal.enc -out ./client/.env.internal -d -md md5
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.alpha.enc -out ./client/.env.alpha -d -md md5
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.beta.enc -out ./client/.env.beta -d -md md5
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.production.enc -out ./client/.env.production -d -md md5