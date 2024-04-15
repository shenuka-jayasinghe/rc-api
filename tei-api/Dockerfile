# Use an official Node.js runtime as the parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Create ENV variable to activate connection to internal KSQLDB Server // in connection.js
ENV NODE_ENV="prod"

# Expose the port the app runs on
EXPOSE 3000

# Start the Node.js Express server
CMD ["node", "app.js"]
