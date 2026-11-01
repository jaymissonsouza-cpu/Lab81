# Imagem leve para o VPS (EasyPanel/Docker). Não compila o site: o supervisor (deploy/boot.mjs)
# baixa a versão já construída pelo GitHub Actions (release "producao") e se atualiza sozinho.
FROM node:22-bookworm-slim
WORKDIR /srv
COPY deploy/boot.mjs /srv/boot.mjs
ENV STORAGE_DIR=/data \
    SITE_URL=https://lab81studio.com.br \
    BOOT_URL=https://raw.githubusercontent.com/jaymissonsouza-cpu/Lab81/main/deploy/boot.mjs
VOLUME ["/data"]
EXPOSE 3000
# Usa a versão mais recente do supervisor; se o download falhar, usa a cópia embutida.
CMD ["sh", "-c", "node -e \"fetch(process.env.BOOT_URL).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>require('fs').writeFileSync('/srv/boot.mjs',t))\" 2>/dev/null; exec node /srv/boot.mjs"]
