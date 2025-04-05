#!/bin/bash

# CONFIGURA ESTOS VALORES
DO_REGISTRY="registry.digitalocean.com/monteagudo"
IMAGE_NAME="bit2me-trading-bot"
PORT=8080
APP_ENV="NODE_ENV=production"

# CARGAR TOKEN DESDE .env
source /opt/app/.env

# LOGIN AL REGISTRY
echo $DO_API_TOKEN | docker login $DO_REGISTRY -u doctl --password-stdin

# INSTALAR DOCKER Y DOCKER-COMPOSE
apt update
apt install -y docker.io docker-compose

# CREAR docker-compose.yml
cat > /opt/app/docker-compose.yml <<EOF
version: '3.8'
services:
  app:
    image: $DO_REGISTRY/$IMAGE_NAME:1.0.0
    restart: always
    ports:
      - "$PORT:$PORT"
    environment:
      - $APP_ENV

  watchtower:
    image: containrrr/watchtower
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 60
EOF

# LEVANTAR SERVICIOS
cd /opt/app
docker-compose up -d

# CREAR SCRIPT DE ARRANQUE
cat > /opt/app/start.sh <<'EOS'
#!/bin/bash
source /opt/app/.env
cd /opt/app
echo $DO_API_TOKEN | docker login registry.digitalocean.com -u doctl --password-stdin
docker-compose pull
docker-compose up -d
EOS

chmod +x /opt/app/start.sh
chmod 600 /opt/app/.env

# CREAR SYSTEMD SERVICE
cat > /etc/systemd/system/app.service <<EOF
[Unit]
Description=Start Docker App on boot
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/opt/app/start.sh
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF

# HABILITAR SERVICE
systemctl daemon-reexec
systemctl daemon-reload
systemctl enable app.service
systemctl start app.service

echo "✅ Setup seguro completado. Token leído desde .env, no expuesto. App corriendo en $PORT."
