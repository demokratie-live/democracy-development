FROM node:16-alpine AS base_stage
WORKDIR /app

FROM base_stage as build_stage
WORKDIR /app
RUN apk --update --no-cache add git python3 make g++
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
ENTRYPOINT [ "yarn", "run", "dev" ]

FROM build_stage as install_stage
WORKDIR /app
RUN apk --update --no-cache add curl
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN rm -rf node_modules
RUN yarn install --frozen-lockfile --production
RUN node-prune node_modules

FROM base_stage as production_stage
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY --from=build_stage /app/dist ./dist
COPY --from=install_stage /app/node_modules ./node_modules

ENTRYPOINT [ "yarn", "run", "serve" ]
