# Build

FROM node:lts-alpine

RUN apk add --no-cache curl

WORKDIR /server

# Acquire dependencies

COPY server/package*.json ./

RUN npm install

# Copy server source code

COPY server/. .

# Deploy

EXPOSE 4000

CMD ["node", "server.js"]