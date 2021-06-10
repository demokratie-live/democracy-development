FROM node:14-alpine AS base_stage
WORKDIR /app

FROM base_stage as build_stage
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM base_stage as production_stage
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --from=build_stage /app/build ./build
ENTRYPOINT [ "yarn", "run", "start" ]

