#!/usr/bin/env bash
# Preparação ÚNICA de um VPS Ubuntu 22.04/24.04 (x86_64) para o site da LAB81.
# Uso (como root):  curl -fsSL <url-raw-deste-arquivo> -o setup-vps.sh && bash setup-vps.sh
# Depois disso, as publicações são automáticas pelo GitHub Actions (push na branch main).
set -euo pipefail

[ "$(id -u)" = 0 ] || { echo "Execute como root (sudo -i)."; exit 1; }

read -rp "Domínio principal (ex.: www.lab81.com.br): " DOMAIN
read -rp "Domínio sem www para redirecionar (ex.: lab81.com.br, ou vazio): " APEX
read -rp "E-mail do administrador do painel: " ADMIN_EMAIL
read -rsp "Senha do painel (mín. 10 caracteres): " ADMIN_PASS; echo
[ ${#ADMIN_PASS} -ge 10 ] || { echo "Senha muito curta."; exit 1; }
read -rp "Chave PÚBLICA SSH de deploy (linha ssh-ed25519 ...): " DEPLOY_PUBKEY

echo "==> Pacotes"
apt-get update -y
apt-get install -y ca-certificates curl gnupg nginx sqlite3 certbot python3-certbot-nginx ufw
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "==> Usuário e pastas"
id lab81 >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash lab81
mkdir -p /srv/lab81/{releases,storage,backups}
install -d -m 700 -o lab81 -g lab81 /home/lab81/.ssh
grep -qF "$DEPLOY_PUBKEY" /home/lab81/.ssh/authorized_keys 2>/dev/null || echo "$DEPLOY_PUBKEY" >> /home/lab81/.ssh/authorized_keys
chown lab81:lab81 /home/lab81/.ssh/authorized_keys && chmod 600 /home/lab81/.ssh/authorized_keys
chown -R lab81:lab81 /srv/lab81

echo "==> Configuração (.env)"
if [ ! -f /srv/lab81/.env ]; then
  HASH=$(ADMIN_PASS="$ADMIN_PASS" node -e '
    const c=require("crypto");const s=c.randomBytes(16);const N=16384,r=8,p=1;
    const h=c.scryptSync(process.env.ADMIN_PASS,s,64,{N,r,p});
    console.log(`scrypt:${N}:${r}:${p}:${s.toString("base64")}:${h.toString("base64")}`)')
  cat > /srv/lab81/.env <<ENV
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
STORAGE_DIR=/srv/lab81/storage
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD_HASH=$HASH
SESSION_SECRET=$(openssl rand -hex 32)
# Opcionais: SMTP_HOST= SMTP_PORT=587 SMTP_USER= SMTP_PASSWORD= SMTP_FROM= QUOTE_NOTIFY_EMAIL=
# QUOTE_WEBHOOK_URL= QUOTE_WEBHOOK_SECRET= GOOGLE_SITE_VERIFICATION=
ENV
  chown lab81:lab81 /srv/lab81/.env && chmod 600 /srv/lab81/.env
fi

echo "==> Serviço systemd"
cat > /etc/systemd/system/lab81.service <<'UNIT'
[Unit]
Description=LAB81 Studio (Next.js)
After=network.target

[Service]
Type=simple
User=lab81
WorkingDirectory=/srv/lab81/current
EnvironmentFile=/srv/lab81/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=/srv/lab81

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable lab81
# O usuário de deploy pode apenas reiniciar o serviço do site
echo "lab81 ALL=(root) NOPASSWD: /bin/systemctl restart lab81" > /etc/sudoers.d/lab81-deploy
chmod 440 /etc/sudoers.d/lab81-deploy

echo "==> Nginx"
SERVER_NAMES="$DOMAIN${APEX:+ $APEX}"
cat > /etc/nginx/sites-available/lab81 <<NGINX
server {
    listen 80;
    server_name $SERVER_NAMES;
    client_max_body_size 160m;
    client_body_timeout 300s;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain application/xml;
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
        proxy_request_buffering off;
    }
}
NGINX
ln -sfn /etc/nginx/sites-available/lab81 /etc/nginx/sites-enabled/lab81
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Firewall"
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

echo "==> Backup diário (03:00)"
cat > /usr/local/bin/lab81-backup <<'BK'
#!/usr/bin/env bash
set -euo pipefail
S=/srv/lab81/storage; D=/srv/lab81/backups; T=$(date +%Y%m%d-%H%M)
[ -f "$S/lab81.db" ] && sqlite3 "$S/lab81.db" ".backup '$D/lab81-$T.db'"
tar -czf "$D/arquivos-$T.tar.gz" -C "$S" quotes media 2>/dev/null || true
find "$D" -type f -mtime +14 -delete
BK
chmod +x /usr/local/bin/lab81-backup
echo "0 3 * * * lab81 /usr/local/bin/lab81-backup" > /etc/cron.d/lab81-backup

cat <<DONE

✔ Servidor preparado.

Próximos passos:
 1. DNS: aponte $SERVER_NAMES para o IP deste servidor (registro A).
 2. Publique pela primeira vez (push na branch main no GitHub).
 3. Com o DNS propagado, ative o HTTPS:
      certbot --nginx -d $DOMAIN${APEX:+ -d $APEX} --redirect
 4. No GitHub, secret VPS_KNOWN_HOSTS = saída de:  ssh-keyscan -H $(hostname -I | awk '{print $1}')
DONE
