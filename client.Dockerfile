# Build

FROM node:lts-alpine

RUN apk add --no-cache curl

WORKDIR /client

# Acquire dependencies

COPY client/package*.json ./

RUN npm install

# Build application for production

COPY client./ .

RUN npm run build

# Deploy

EXPOSE 3000

CMD ["npm", "run", "start"]
