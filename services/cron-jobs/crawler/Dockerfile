FROM node:14-alpine AS base_stage
WORKDIR /app

FROM base_stage as build_stage
RUN apk --update --no-cache add git curl
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM build_stage as install_stage
RUN apk --update --no-cache add curl
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN rm -rf node_modules
RUN yarn install --frozen-lockfile --production
RUN node-prune node_modules

FROM base_stage as production_stage
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY --from=build_stage /app/build ./build
COPY --from=install_stage /app/node_modules ./node_modules

CMD [ "yarn", "run", "start:import-procedures" ]
