# Build

FROM node:lts-alpine

RUN apk add --no-cache curl

WORKDIR /server

# Acquire dependencies

COPY package*.json ./

RUN npm install

# Copy server source code

COPY . .

# Deploy

EXPOSE 4000

CMD ["node", "server.js"]