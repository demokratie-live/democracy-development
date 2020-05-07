FROM node:alpine

# TMP - Yarn fix
RUN mkdir -p /opt/yarn/bin && ln -s /opt/yarn/yarn-v1.5.1/bin/yarn /opt/yarn/bin/yarn

# install git
RUN apk update && apk upgrade && \
    apk add --no-cache git

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . .

ENTRYPOINT [ "npm", "run", "dev" ]