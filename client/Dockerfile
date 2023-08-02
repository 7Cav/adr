# Use an official Node.js runtime as the base image
FROM node:lts-alpine

# Change working directory to the client folder
WORKDIR /app

ADD . /app

WORKDIR /app/client
# Install the dependencies
RUN npm install

# Install a simple HTTP server to serve the built files
RUN npm install -g http-server

# Expose the port that the HTTP server will use
EXPOSE 8080

# Set the command to run the HTTP server when the container starts
CMD [ "http-server", "build" ]
