# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build output
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copy built assets from build stage to nginx default serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
