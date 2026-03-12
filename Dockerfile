# Stage 1: Build React app with Node 22 (Required for Capacitor CLI 8+)
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
# Using --frozen-lockfile is a "best practice" for CI to ensure 
# it builds exactly what you have in your yarn.lock
RUN yarn install --frozen-lockfile && yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Ensure this matches your project (Vite usually uses /app/dist, CRA uses /app/build)
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80