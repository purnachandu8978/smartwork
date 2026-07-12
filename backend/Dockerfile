# Base Image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies ignoring scripts
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy application source
COPY . .

# Expose Port
EXPOSE 5000

# Start Application
CMD ["npm", "start"]
