FROM node:latest


RUN mkdir /app

WORKDIR /app

COPY . .

RUN yarn install

ENTRYPOINT [ "yarn", "start" ]