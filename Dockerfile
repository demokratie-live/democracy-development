FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN yarn install
RUN yarn add -g nodemon@latest

COPY . .

ENTRYPOINT [ "nodemon", "-L", "--exec", "babel-node", "src/index.js" ]