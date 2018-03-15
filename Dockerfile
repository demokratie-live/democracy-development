FROM node:latest


RUN mkdir /app

WORKDIR /app

ADD package*.json .

RUN yarn install

COPY . .

ENTRYPOINT [ "yarn", "start" ]