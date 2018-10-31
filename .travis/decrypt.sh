#!/bin/bash

# Environment Variables
openssl aes-256-cbc -k "$SECRET" -in ./.travis/.env.travis.enc -out ./.travis/.env.travis -d

# SSH Key for Digital Ocean
openssl aes-256-cbc -k "$SECRET" -in ./.travis/ssh_key.enc -out ./.travis/ssh_key -d
openssl aes-256-cbc -k "$SECRET" -in ./.travis/ssh_key.pub.enc -out ./.travis/ssh_key.pub -d

# Server .env
openssl aes-256-cbc -k "$SECRET" -in ./democracy-app.de-api/.env.enc -out ./democracy-app.de-api/.env -d
# Server-Admin .env
openssl aes-256-cbc -k "$SECRET" -in ./democracy-app.de-admin/.env.enc -out ./democracy-app.de-admin/.env -d

# Bundestag.io .env
openssl aes-256-cbc -k "$SECRET" -in ./bundestag.io/.env.enc -out ./bundestag.io/.env -d
# Bundestag.io Admin .env
openssl aes-256-cbc -k "$SECRET" -in ./bundestag.io-admin/.env.enc -out ./bundestag.io-admin/.env -d

# Desktop Cient .env
openssl aes-256-cbc -k "$SECRET" -in ./democracy-app.de/.env.enc -out ./democracy-app.de/.env -d

# Client Store Credentials
openssl aes-256-cbc -k "$SECRET" -in ./client/android/Google_Play_Android_Developer.json.enc -out ./client/android/Google_Play_Android_Developer.json -d
openssl aes-256-cbc -k "$SECRET" -in ./client/android/app/democracy2-release-key.keystore.enc -out ./client/android/app/democracy2-release-key.keystore -d  
# Client .env's
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.internal.enc -out ./client/.env.internal -d
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.alpha.enc -out ./client/.env.alpha -d
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.beta.enc -out ./client/.env.beta -d
openssl aes-256-cbc -k "$SECRET" -in ./client/.env.production.enc -out ./client/.env.production -d