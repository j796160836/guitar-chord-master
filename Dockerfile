# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Build the project
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

WORKDIR /usr/share/nginx/html

# Copy the build output from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
