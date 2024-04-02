FROM node:buster AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:latest as runner
WORKDIR /var/www/poll
COPY --from=builder /app/public /var/www/poll/html

# setup nginx configuration
COPY ./site.conf /etc/nginx/nginx.conf