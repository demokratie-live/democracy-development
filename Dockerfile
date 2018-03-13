FROM node:carbon

# ------------------------
# SSH Server support
# ------------------------
RUN apt-get update


EXPOSE 3100

# Install App

WORKDIR /app

COPY package*.json ./

RUN yarn install

VOLUME .:/app

COPY . .

ENTRYPOINT ["yarn", "start"]