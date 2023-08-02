FROM node:14.21.3-alpine3.17

WORKDIR /app

ADD . /app

RUN npm ci

CMD ["node", "./server/server.js"]