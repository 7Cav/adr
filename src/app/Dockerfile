# Use an official Node.js runtime as the base image
FROM node:lts-alpine

COPY . /app
# Install the dependencies
WORKDIR /app/src/app

RUN npm install

RUN npm install -g http-server

# Expose the port that the HTTP server will use
EXPOSE 8090

# Set the command to run the HTTP server when the container starts
CMD [ "http-server", "build", "-P", "http://localhost:8090?/" ]