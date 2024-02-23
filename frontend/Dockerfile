FROM node:16-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . ./
RUN npm run build


FROM nginx:latest as frontend

COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx/conf.d/default.conf /etc/nginx/conf.d

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]