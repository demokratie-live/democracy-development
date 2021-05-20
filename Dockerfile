FROM node:14-alpine AS BASE
WORKDIR /app

FROM BASE as BUILD
RUN apk --update --no-cache add git python3 make g++
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM BUILD as INSTALL
RUN apk --update --no-cache add curl
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN rm -rf node_modules
RUN yarn install --frozen-lockfile --production
RUN node-prune node_modules

FROM BASE as PRODUCTION
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY --from=BUILD /app/built ./built
COPY --from=INSTALL /app/node_modules ./node_modules

ENTRYPOINT [ "yarn", "run", "start" ]
