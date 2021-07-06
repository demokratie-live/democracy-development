FROM node:12-alpine AS BUILD_IMAGE

# install next-optimized-images requirements
RUN apk --no-cache update \ 
    && apk --no-cache add yarn curl g++ make bash zlib-dev libpng-dev python \
    &&  rm -fr /var/cache/apk/*

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .

RUN yarn build

RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

FROM node:12-alpine

WORKDIR /app

COPY . .

# copy from build image
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

ENV NODE_ENV=production

ENTRYPOINT [ "yarn", "start" ]