#!/usr/bin/env bash
# Executado NO SERVIDOR pelo GitHub Actions. Ativa uma release, confere a saúde e volta atrás se falhar.
set -euo pipefail
RELEASE="$1"
BASE=/srv/lab81
NEW="$BASE/releases/$RELEASE"
PREV=$(readlink -f "$BASE/current" 2>/dev/null || true)

ln -sfn "$NEW" "$BASE/current.tmp" && mv -Tf "$BASE/current.tmp" "$BASE/current"
sudo /bin/systemctl restart lab81

healthy=false
for i in $(seq 1 20); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then healthy=true; break; fi
  sleep 2
done

if [ "$healthy" != true ]; then
  echo "Nova versão não respondeu. Revertendo para a anterior." >&2
  if [ -n "$PREV" ] && [ -d "$PREV" ]; then
    ln -sfn "$PREV" "$BASE/current.tmp" && mv -Tf "$BASE/current.tmp" "$BASE/current"
    sudo /bin/systemctl restart lab81
  fi
  exit 1
fi

# Refaz as páginas geradas no build usando os dados reais do banco de produção
TOKEN=$(grep -E '^SESSION_SECRET=' "$BASE/.env" | cut -d= -f2-)
curl -fsS -X POST -H "x-revalidate-token: $TOKEN" http://127.0.0.1:3000/api/revalidate >/dev/null || echo "aviso: revalidação falhou" >&2

# Mantém as 5 releases mais recentes
ls -1dt "$BASE"/releases/*/ | tail -n +6 | xargs -r rm -rf
echo "Release $RELEASE publicada."
