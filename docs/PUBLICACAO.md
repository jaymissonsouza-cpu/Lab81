# Publicação — Hostinger VPS (Docker) + GitHub

## Como funciona

```
push na main ──► GitHub Actions: lint, tipos, build ──► release "producao" (release.tgz)
                                                                │
VPS Hostinger (Docker Manager, projeto "lab81")                 │ verifica a cada 5 min
  ├─ app   (node:22) ── deploy/boot.mjs ◄───────────────────────┘ baixa, sobe, testa; reverte se falhar
  └─ caddy (proxy + HTTPS automático Let's Encrypt)
volume lab81-data → banco SQLite, arquivos de orçamento e imagens do painel (preservado entre versões)
```

Nenhum acesso SSH nem segredo no GitHub é necessário. As senhas (hash do admin, `SESSION_SECRET`, SMTP) ficam
apenas nas variáveis do projeto Docker no VPS.

## Operação (pela API da Hostinger)

Requer o token da API da Hostinger disponível no ambiente (`HOSTINGER_API_TOKEN` ou injetado pelo proxy).

| Ação | Comando |
|---|---|
| Ver VPS, domínio e projetos | `node scripts/hostinger.mjs status` |
| Primeira instalação | `ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/hostinger.mjs deploy` |
| Apontar domínio (@ e www) para o VPS | `node scripts/hostinger.mjs dns` |
| Ativar HTTPS no domínio | `node scripts/hostinger.mjs https` |
| Forçar atualização imediata | `node scripts/hostinger.mjs restart` |
| Logs | `node scripts/hostinger.mjs logs` |

Sem token, o mesmo pode ser feito pelo hPanel: **VPS → Docker Manager → Compose a partir de URL**, colando
`https://raw.githubusercontent.com/jaymissonsouza-cpu/Lab81/main/deploy/docker-compose.yaml` e preenchendo as variáveis.

## Variáveis do projeto Docker

| Variável | Exemplo |
|---|---|
| `SITE_ADDRESS` | `:80` (só IP, sem HTTPS) → depois `lab81studio.com.br, www.lab81studio.com.br` |
| `SITE_URL` | `https://lab81studio.com.br` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` | hash gerado por `npm run admin:hash -- "senha"` |
| `SESSION_SECRET` | 64 caracteres aleatórios |
| `SMTP_*`, `QUOTE_NOTIFY_EMAIL`, `QUOTE_WEBHOOK_*` | opcionais |
| `GH_TOKEN` | só se o repositório ficar **privado** (token de leitura de conteúdo do GitHub) |

## Repositório privado

O servidor baixa as versões da release do GitHub. Com o repositório público isso funciona sem credenciais.
Para torná-lo privado: crie um token *fine-grained* com permissão de leitura em **Contents** apenas deste repositório
e coloque em `GH_TOKEN` no projeto Docker **antes** de mudar a visibilidade.

## Testado em 01/11/2026

Contêiner `node:22-bookworm-slim` rodando `boot.mjs` contra a release real: download, start, páginas 200,
orçamento com upload gravado no volume, otimização de imagens (sharp) e banco (better-sqlite3) funcionando, e troca
automática de versão após novo push.
