FROM node:12-alpine

RUN apk --no-cache update \ 
    && apk --no-cache add git \
    &&  rm -fr /var/cache/apk/*

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .

ENV NODE_ENV=development

ENTRYPOINT [ "yarn", "dev" ]