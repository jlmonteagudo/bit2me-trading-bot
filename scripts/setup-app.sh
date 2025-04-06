#!/bin/bash

# =============================================
# CONFIGURACIÓN INICIAL
# =============================================

# Cargar variables de entorno
set -a
source /opt/app/.env || { echo "❌ Error: No se pudo cargar .env"; exit 1; }
set +a

# Configuración adicional
DOMAIN="bit2me-trading.duckdns.org"
APP_PORT="8080"
CERTBOT_VENV_PATH="/opt/certbot-venv"
CERTBOT_CONFIG_DIR="/opt/app/certbot"

# =============================================
# FUNCIONES AUXILIARES
# =============================================

function log_success() {
  echo "✅ $1"
}

function log_error() {
  echo "❌ Error: $1"
  exit 1
}

function update_duckdns_ip() {
  echo "🦆 Actualizando IP en DuckDNS..."
  local current_ip=$(curl -4 -s http://ifconfig.me)
  curl -s "https://www.duckdns.org/update?domains=${DOMAIN%%.*}&token=${DUCKDNS_TOKEN}&ip=${current_ip}" || log_error "Falló la actualización de DuckDNS"
  log_success "DuckDNS actualizado"
}

function setup_certbot_venv() {
  echo "🐍 Configurando entorno virtual para Certbot..."
  
  # Instalar dependencias del sistema
  apt update -qq && apt upgrade -y -qq
  apt install -y -qq python3 python3-venv python3-pip docker.io docker-compose nginx || log_error "Falló la instalación de dependencias"

  # Crear y configurar entorno virtual
  python3 -m venv "${CERTBOT_VENV_PATH}" || log_error "Falló al crear entorno virtual"
  "${CERTBOT_VENV_PATH}"/bin/pip install --upgrade pip certbot certbot-dns-duckdns || log_error "Falló la instalación de Certbot"

  log_success "Entorno virtual de Certbot configurado"
}

function obtain_ssl_certificate() {
  echo "🔐 Obteniendo certificado SSL..."
  
  # Configurar credenciales DuckDNS
  mkdir -p "${CERTBOT_CONFIG_DIR}"/duckdns
  cat > "${CERTBOT_CONFIG_DIR}"/duckdns/duckdns.ini <<EOF
dns_duckdns_token = ${DUCKDNS_TOKEN}
dns_duckdns_propagation_seconds = 60
EOF
  chmod 600 "${CERTBOT_CONFIG_DIR}"/duckdns/duckdns.ini

  # Primero verificar la conexión con DuckDNS
  echo "🛠️ Verificando conexión con DuckDNS..."
  local current_ip=$(curl -4 -s http://ifconfig.me)
  local update_result=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN%%.*}&token=${DUCKDNS_TOKEN}&ip=${current_ip}&verbose=true")
  echo "Resultado de DuckDNS: $update_result"
  
  # Obtener certificado
  "${CERTBOT_VENV_PATH}"/bin/certbot certonly \
    --non-interactive \
    --agree-tos \
    --email "${ADMIN_EMAIL}" \
    --authenticator dns-duckdns \
    --dns-duckdns-credentials "${CERTBOT_CONFIG_DIR}"/duckdns/duckdns.ini \
    --dns-duckdns-propagation-seconds 120 \
    --domain "${DOMAIN}" \
    --config-dir "${CERTBOT_CONFIG_DIR}"/conf \
    --work-dir "${CERTBOT_CONFIG_DIR}"/work \
    --logs-dir "${CERTBOT_CONFIG_DIR}"/log || log_error "Falló al obtener certificado SSL"
    
  # Ajustar permisos
  chmod -R 755 "${CERTBOT_CONFIG_DIR}"/conf/live
  chmod 644 "${CERTBOT_CONFIG_DIR}"/conf/live/${DOMAIN}/fullchain.pem
  chmod 644 "${CERTBOT_CONFIG_DIR}"/conf/live/${DOMAIN}/privkey.pem
  chown -R root:root "${CERTBOT_CONFIG_DIR}"/conf/live

  log_success "Certificado SSL obtenido"
}

function configure_nginx() {
  echo "🛠 Configurando Nginx..."
  
  mkdir -p /opt/app/nginx
  cat > /opt/app/nginx/nginx.conf <<EOF
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    upstream nodejs {
        server app:${APP_PORT};
    }

    server {
        listen 80;
        server_name ${DOMAIN};
        return 301 https://\$host\$request_uri;
    }

    server {
        listen 443 ssl;
        server_name ${DOMAIN};

        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

        location / {
            proxy_pass http://nodejs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

  log_success "Nginx configurado"
}

function setup_docker_compose() {
  echo "🐳 Configurando Docker Compose..."
  
  cat > /opt/app/docker-compose.yml <<EOF
version: '3.8'

services:
  app:
    image: ${DO_REGISTRY}/${APP_IMAGE_NAME}:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - app-network
    ports:
      - "${APP_PORT}:${APP_PORT}"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/app/nginx/nginx.conf:/etc/nginx/nginx.conf
      - /opt/app/certbot/conf/live:/etc/letsencrypt/live:ro
      - /opt/app/certbot/conf/archive:/etc/letsencrypt/archive:ro
      - /opt/app/certbot/www:/var/www/certbot
    depends_on:
      - app
    networks:
      - app-network

  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_POLL_INTERVAL=60
      - WATCHTOWER_CLEANUP=true
    command: --label-enable --scope app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  certbot-etc:
    driver: local
EOF

  log_success "Docker Compose configurado"
}

function configure_automatic_updates() {
  echo "🔄 Configurando actualizaciones automáticas..."
  
  # Script para actualizar la aplicación
  cat > /opt/app/update.sh <<EOF
#!/bin/bash
source /opt/app/.env
echo "\${DO_API_TOKEN}" | docker login ${DO_REGISTRY} -u doctl --password-stdin
docker-compose -f /opt/app/docker-compose.yml pull app
docker-compose -f /opt/app/docker-compose.yml up -d --force-recreate app
EOF
  chmod +x /opt/app/update.sh

  # Script para renovar certificados
  cat > /opt/app/renew-certs.sh <<EOF
#!/bin/bash
source /opt/app/.env
${CERTBOT_VENV_PATH}/bin/certbot renew \\
  --non-interactive \\
  --dns-duckdns \\
  --dns-duckdns-credentials ${CERTBOT_CONFIG_DIR}/duckdns/duckdns.ini \\
  --config-dir ${CERTBOT_CONFIG_DIR}/conf \\
  --work-dir ${CERTBOT_CONFIG_DIR}/work \\
  --logs-dir ${CERTBOT_CONFIG_DIR}/log
docker-compose -f /opt/app/docker-compose.yml restart nginx
EOF
  chmod +x /opt/app/renew-certs.sh

  # Agregar tareas cron
  (crontab -l 2>/dev/null; echo "0 3 * * * /opt/app/renew-certs.sh >> /var/log/certbot-renew.log 2>&1") | crontab -

  log_success "Actualizaciones automáticas configuradas"
}

function start_services() {
  echo "🚀 Iniciando servicios..."
  
  # Cambiar al directorio correcto
  cd /opt/app || log_error "No se pudo acceder a /opt/app"

  # 1. Detener servicios previos y liberar puertos
  echo "🛑 Deteniendo servicios existentes y liberando puertos..."
  docker-compose down 2>/dev/null || true
  
  # Matar cualquier proceso usando los puertos 80/443
  sudo fuser -k 80/tcp 2>/dev/null || true
  sudo fuser -k 443/tcp 2>/dev/null || true
  sleep 2  # Esperar que los puertos se liberen

  # 2. Verificar puertos libres
  echo "🔍 Verificando puertos..."
  if ss -tulnp | grep -E ':80|:443'; then
    echo "⚠️  Procesos usando puertos:"
    sudo ss -tulnp | grep -E ':80|:443'
    log_error "Los puertos 80/443 están en uso"
  fi

  # 3. Iniciar sesión en Docker Registry
  echo "🔑 Autenticando en Docker Registry..."
  echo "${DO_API_TOKEN}" | docker login "${DO_REGISTRY}" -u doctl --password-stdin 2>&1 | grep -v "WARNING" || log_error "Falló el login en Docker Registry"

  # 4. Descargar imágenes
  echo "📦 Descargando imágenes Docker..."
  docker-compose pull || log_error "Falló al descargar imágenes"

  # 5. Iniciar servicios
  echo "🔄 Iniciando contenedores..."
  docker-compose up -d || log_error "Falló al iniciar contenedores"

  # 6. Verificar
  echo "⏳ Esperando inicialización..."
  sleep 5
  
  if ! docker ps | grep nginx; then
    echo "⚠️  Nginx no se inició, mostrando logs..."
    docker logs $(docker ps -lq --filter "name=nginx")
    log_error "Nginx no se está ejecutando"
  fi

  log_success "Servicios iniciados correctamente"
}

# =============================================
# EJECUCIÓN PRINCIPAL
# =============================================

# 1. Configurar entorno de Certbot
setup_certbot_venv

# 2. Actualizar IP en DuckDNS
update_duckdns_ip

# 3. Obtener certificado SSL
obtain_ssl_certificate

# 4. Configurar Nginx
configure_nginx

# 5. Configurar Docker Compose
setup_docker_compose

# 6. Configurar actualizaciones automáticas
configure_automatic_updates

# 7. Iniciar servicios
start_services

# =============================================
# FINALIZACIÓN
# =============================================
echo "🎉 ¡Despliegue completado con éxito!"
echo "🌐 URL: https://${DOMAIN}"
echo "🔒 Certificado SSL: ${CERTBOT_CONFIG_DIR}/conf/live/${DOMAIN}/"
echo "🔄 Renovación automática configurada via cron"