# Stage 1: Build React app with Node 20
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install && yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
