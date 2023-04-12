# Use Node 16 Alpine image as the base
FROM node:16-alpine AS base_stage

# Set the working directory
WORKDIR /app

# Update package lists and install Git and Curl
RUN apk update && \
    apk add --no-cache git curl python3 make g++

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies and clean cache
RUN yarn install --no-progress --pure-lockfile && \
    yarn cache clean

# Copy remaining files
COPY . .

###
### Build stage
###
FROM base_stage as build_stage
WORKDIR /app
RUN yarn build

###
### Install stage
###
FROM build_stage as install_stage
WORKDIR /app

# Remove unnecessary files and reinstall dependencies in production mode
RUN curl -sf https://gobinaries.com/tj/node-prune | sh && \
    rm -rf node_modules && \
    yarn install --no-progress --pure-lockfile --production && \
    yarn cache clean && \
    node-prune

###
### Final image
###
FROM node:16-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy dependency files
COPY package.json yarn.lock ./

# Copy compiled files from the build stage
COPY --from=build_stage /app/build ./build

# Copy cleaned node_modules from the install stage
COPY --from=install_stage /app/node_modules ./node_modules

# Set the start command
CMD [ "yarn", "start" ]