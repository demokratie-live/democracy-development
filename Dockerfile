FROM node:12

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . .

ENTRYPOINT [ "npm", "run", "dev" ]