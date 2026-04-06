# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
RUN npm ci --no-optional

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Expose default port
EXPOSE 80

# Set default PORT environment variable
ENV PORT=80

# Use PORT env var from Render
CMD sh -c "envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"
