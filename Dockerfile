FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN yarn install
RUN npm install nodemon@latest -g

COPY . .

ENTRYPOINT [ "nodemon", "-L", "--exec", "babel-node", "src/index.js" ]