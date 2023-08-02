# Use an official Node.js runtime as the base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

ADD . /app
# Install the dependencies
RUN npm ci

# Expose the port that the HTTP server will use
EXPOSE 4000

# Set the command to run the HTTP server when the container starts
CMD [ "node", "./server/server.js" ]
