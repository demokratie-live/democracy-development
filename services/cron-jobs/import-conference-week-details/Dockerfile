FROM node:16-alpine AS BUILD_IMAGE

# install next-optimized-images requirements
RUN apk --no-cache update \ 
    && apk --no-cache add curl bash git \
    &&  rm -fr /var/cache/apk/*

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm --frozen-lockfile
COPY . .

RUN pnpm build

FROM node:16-alpine

WORKDIR /app

COPY . .

# copy from build image
COPY --from=BUILD_IMAGE /app/build ./build
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

ENV NODE_ENV=production

ENTRYPOINT [ "pnpm", "start" ]