FROM node:12.11.1

# TMP - Yarn fix
RUN mkdir -p /opt/yarn/bin && ln -s /opt/yarn/yarn-v1.5.1/bin/yarn /opt/yarn/bin/yarn

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

ENTRYPOINT [ "yarn", "serve" ]