#!/bin/bash
cd client
nvm install 8
npm install -g yarn
yarn --version
yarn install
cd ..