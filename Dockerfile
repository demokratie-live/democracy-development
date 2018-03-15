FROM node:latest


RUN mkdir /app

ADD package*.json /app
WORKDIR /app

#COPY package*.json ./

RUN git --version
RUN yarn install

COPY . .

ENTRYPOINT [ "yarn", "start" ]