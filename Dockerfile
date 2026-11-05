# Stage 1: Build React app with Node 22 (Required for Capacitor CLI 8+)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./

RUN npm ci

COPY . .

RUN CI=false npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Based on your logs, CRA is using /app/build
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80