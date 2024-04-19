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

# Set to production ENV variable
ENV NODE_ENV="prod"

# Start the Node.js Express server
CMD ["node", "app.js"]
