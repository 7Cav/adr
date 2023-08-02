# Use an official Node.js runtime as the base image
FROM node:lts-alpine

COPY . /app
# Install the dependencies
WORKDIR /app/client

RUN npm install

# Install a simple HTTP server to serve the built files
RUN npm install -g http-server

RUN npx browserslist@latest --update-db

RUN npm  run build

# Expose the port that the HTTP server will use
EXPOSE 8080

# Set the command to run the HTTP server when the container starts
CMD [ "http-server", "build" ]
