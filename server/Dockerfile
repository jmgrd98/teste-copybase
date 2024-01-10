# Use an official Node runtime as a parent image
FROM node:14

# Set work directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json /app/

RUN npm install

# Bundle app source
COPY . /app/

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npx", "ts-node", "index.ts"]
