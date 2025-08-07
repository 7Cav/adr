# Build

FROM node:lts-alpine

RUN apk add --no-cache curl

WORKDIR /client

# Acquire dependencies

COPY package*.json ./

RUN npm install

# Copy source code

COPY . .

# Expose, Deployment is handled by compose to allow server to start first

EXPOSE 3000