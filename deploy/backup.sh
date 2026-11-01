#!/usr/bin/env bash
# Backup diário do banco e dos arquivos enviados. Agende no cron:
#   0 3 * * * /srv/lab81/app/deploy/backup.sh >> /var/log/lab81-backup.log 2>&1
set -euo pipefail
STORAGE=${STORAGE_DIR:-/srv/lab81/storage}
DEST=${BACKUP_DIR:-/srv/lab81/backups}
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p "$DEST"
# Cópia consistente do SQLite (funciona com o site no ar)
sqlite3 "$STORAGE/lab81.db" ".backup '$DEST/lab81-$STAMP.db'"
tar -czf "$DEST/arquivos-$STAMP.tar.gz" -C "$STORAGE" quotes media 2>/dev/null || true
# Mantém 14 dias
find "$DEST" -type f -mtime +14 -delete
echo "backup ok $STAMP"
