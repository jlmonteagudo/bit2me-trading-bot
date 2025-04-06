#!/bin/bash

# =============================================
# CONFIGURACIÓN INICIAL
# =============================================

# Cargar variables de entorno
set -a
source /opt/app/.env || { echo "❌ Error: No se pudo cargar .env"; exit 1; }
set +a

# Verificación de variables críticas
required_vars=(
  "DO_API_TOKEN" 
  "DUCKDNS_TOKEN" 
  "ADMIN_EMAIL"
  "DO_REGISTRY"
  "APP_IMAGE_NAME"
  "DOMAIN"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: La variable $var no está definida en .env"
    exit 1
  fi
done

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

  # Comando Certbot corregido (versión probada)
  "${CERTBOT_VENV_PATH}"/bin/certbot certonly \
    --non-interactive \
    --agree-tos \
    --email "${ADMIN_EMAIL}" \
    --authenticator dns-duckdns \
    --dns-duckdns-credentials "${CERTBOT_CONFIG_DIR}"/duckdns/duckdns.ini \
    --dns-duckdns-propagation-seconds 60 \
    --domain "${DOMAIN}" \
    --config-dir "${CERTBOT_CONFIG_DIR}"/conf \
    --work-dir "${CERTBOT_CONFIG_DIR}"/work \
    --logs-dir "${CERTBOT_CONFIG_DIR}"/log || log_error "Falló al obtener certificado SSL"

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

        ssl_certificate ${CERTBOT_CONFIG_DIR}/conf/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key ${CERTBOT_CONFIG_DIR}/conf/live/${DOMAIN}/privkey.pem;

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

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/app/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ${CERTBOT_CONFIG_DIR}/conf:/etc/letsencrypt
      - ${CERTBOT_CONFIG_DIR}/www:/var/www/certbot
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
docker-compose -f /opt/app/docker-compose.yml stop nginx
${CERTBOT_VENV_PATH}/bin/certbot renew \\
  --non-interactive \\
  --dns-duckdns \\
  --dns-duckdns-credentials ${CERTBOT_CONFIG_DIR}/duckdns/duckdns.ini \\
  --config-dir ${CERTBOT_CONFIG_DIR}/conf \\
  --work-dir ${CERTBOT_CONFIG_DIR}/work \\
  --logs-dir ${CERTBOT_CONFIG_DIR}/log
docker-compose -f /opt/app/docker-compose.yml start nginx
EOF
  chmod +x /opt/app/renew-certs.sh

  # Agregar tareas cron
  (crontab -l 2>/dev/null; echo "0 3 * * * /opt/app/renew-certs.sh >> /var/log/certbot-renew.log 2>&1") | crontab -

  log_success "Actualizaciones automáticas configuradas"
}

function start_services() {
  echo "🚀 Iniciando servicios..."
  
  cd /opt/app || log_error "No se pudo acceder a /opt/app"
  echo "${DO_API_TOKEN}" | docker login "${DO_REGISTRY}" -u doctl --password-stdin || log_error "Falló el login en Docker Registry"
  docker-compose pull || log_error "Falló al descargar imágenes"
  docker-compose up -d || log_error "Falló al iniciar contenedores"

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
