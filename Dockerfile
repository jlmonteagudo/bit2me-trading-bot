FROM --platform=linux/amd64 node:22-alpine AS node_app

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .


FROM nginx:alpine

RUN apk add --no-cache nodejs npm

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=node_app /usr/src/app /usr/src/app

RUN apk add --no-cache supervisor

COPY supervisord.conf /etc/supervisord.conf

# Exponer los puertos necesarios (WebSocket y HTTP)
EXPOSE 80
EXPOSE 8080

# Usamos supervisord para arrancar ambos procesos
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
