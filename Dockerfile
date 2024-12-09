# Use Node.js LTS as the base image
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the backend source code
COPY . .
# Expose the port that the backend server listens on
EXPOSE 5000
# Start the backend server
CMD ["npm", "start"]