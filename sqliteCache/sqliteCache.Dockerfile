FROM node:lts-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

FROM node:lts-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

RUN mkdir -p /sqliteCache

EXPOSE 5000

CMD ["node", "sqliteCache.js"]