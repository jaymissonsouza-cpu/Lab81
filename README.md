# LAB81 Studio — website

Site institucional, portfólio, catálogo, blog e sistema de orçamentos da **LAB81 Studio** (design e impressão 3D em Recife).

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · SQLite (better-sqlite3) · sharp · zod.
Hospedagem prevista: **VPS própria** com Node.js + Nginx.

---

## 1. Rodar localmente

Requisitos: Node.js **20.9+** (recomendado 22 LTS).

```bash
npm install
cp .env.example .env.local      # ajuste as variáveis (ver seção 3)
npm run dev                     # http://localhost:3000
```

Na primeira execução o banco é criado em `storage/lab81.db` e populado com o conteúdo inicial
(categorias, artigos do blog e projetos/produtos **demonstrativos**).

Para acessar o painel (`/admin`), gere o hash da senha e preencha o `.env.local`:

```bash
npm run admin:hash -- "uma-senha-forte-aqui"   # copie a saída para ADMIN_PASSWORD_HASH
openssl rand -hex 32                           # use como SESSION_SECRET
```

Scripts úteis: `npm run lint` · `npm run typecheck` · `npm run build` · `npm run start:standalone`.

## 2. Estrutura

```
src/
  app/
    (site)/                 páginas públicas (home, serviços, projetos, produtos, blog, orçamento…)
    admin/                  painel administrativo (login + área protegida)
    api/orcamento/          recebe o formulário de orçamento (multipart, validação, persistência)
    api/admin/              download de arquivos e exportação CSV (somente autenticado)
    media/[...path]/        serve imagens enviadas pelo painel
    sitemap.ts robots.ts manifest.ts not-found.tsx
  components/
    site/                   Header, Footer, Logo, cards, CTA, breadcrumbs, consentimento/analytics
    quote/                  formulário de orçamento em etapas + dropzone
    admin/                  componentes do painel
    ui/                     ícones e selos
  content/                  textos dos serviços, artigos iniciais do blog, definições do orçamento
  lib/                      banco (db, repos, seed), auth, uploads, SEO, notificações, precificação
public/
  brand/                    logotipo (PNG provisório), ícones, imagem Open Graph
  demo/                     imagens DEMONSTRATIVAS recortadas das referências
storage/                    (gerado, fora do git) banco SQLite, arquivos de orçamento, mídia do painel
deploy/                     Nginx, systemd e script de backup
docs/                       referências visuais, pendências, checklist de testes e SEO
```

### Design system
Definido em `src/app/globals.css` (`@theme`): paleta oficial (Carbon `#111719`, Industrial Orange `#F26A21`,
Off White `#F3F2ED`, Titanium `#B4BBC0`), Space Grotesk (títulos) e Inter (texto), escala tipográfica fluida,
botões, campos, painéis e animações do conceito **Camadas** (`.build-up`, `.reveal`, `.bg-layers`).
Todas as animações respeitam `prefers-reduced-motion`. As revelações ao rolar usam *scroll-driven animations*
em CSS (zero JavaScript).

**Decisão de acessibilidade:** botões laranja usam texto carbono (contraste 6:1). Off-white sobre laranja
ficaria em 2,7:1, abaixo do mínimo WCAG AA.

### Logotipo
`src/components/site/Logo.tsx` é o único ponto de uso. Hoje usa PNGs recortados da referência
(`public/brand/lab81-simbolo.png` e `lab81-wordmark.png`). Ao receber o **SVG oficial**, salve-o em `public/brand/` e
troque os caminhos em `LOGO_ASSETS`. Regere também ícones e imagem OG (`scripts/prepare-reference-assets.mjs`
mostra como foram gerados).

## 3. Variáveis de ambiente

Veja `.env.example`. Principais:

| Variável | Obrigatória | Uso |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | sim (produção) | domínio canônico: canonical, sitemap, Open Graph, JSON-LD |
| `STORAGE_DIR` | recomendada | pasta do banco e uploads (fora da pasta do build, com backup) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | sim, para o painel | login do administrador |
| `SMTP_*`, `QUOTE_NOTIFY_EMAIL` | opcional | e-mail a cada novo orçamento/contato |
| `QUOTE_WEBHOOK_URL`, `QUOTE_WEBHOOK_SECRET` | opcional | integração com CRM (JSON assinado HMAC-SHA256 no header `x-lab81-signature`) |
| `NEXT_PUBLIC_GTM_ID` | opcional | Google Tag Manager (carregado só após consentimento) |
| `GOOGLE_SITE_VERIFICATION` | opcional | meta de verificação do Search Console |

> `NEXT_PUBLIC_*` é embutida no build: rode `npm run build` novamente após alterá-la.

## 4. Publicação na VPS

Exemplo com Ubuntu, usuário `lab81`, código em `/srv/lab81/app` e dados em `/srv/lab81/storage`.

```bash
# 1. Dependências do sistema
sudo apt install -y nginx sqlite3 certbot python3-certbot-nginx
# Node 22 LTS (ex.: via NodeSource ou nvm)

# 2. Código e configuração
sudo mkdir -p /srv/lab81/{storage,backups} && sudo chown -R lab81: /srv/lab81
git clone <repo> /srv/lab81/app && cd /srv/lab81/app
cp .env.example /srv/lab81/.env   # preencha; use STORAGE_DIR=/srv/lab81/storage
npm ci
set -a && . /srv/lab81/.env && set +a && npm run build   # gera .next/standalone (já com public/ e static/)

# 3. Serviço e proxy
sudo cp deploy/lab81.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now lab81
sudo cp deploy/nginx.conf /etc/nginx/sites-available/lab81 && sudo ln -s ../sites-available/lab81 /etc/nginx/sites-enabled/
sudo certbot --nginx -d lab81.com.br -d www.lab81.com.br && sudo nginx -t && sudo systemctl reload nginx

# 4. Backup diário
crontab -e   # 0 3 * * * STORAGE_DIR=/srv/lab81/storage /srv/lab81/app/deploy/backup.sh
```

**Atualizações:** `git pull && npm ci && npm run build && sudo systemctl restart lab81`.

Pontos importantes:
- `client_max_body_size` no Nginx precisa comportar os uploads (padrão do formulário: até 150 MB por envio).
- O banco e os uploads ficam em `STORAGE_DIR` e **não** fazem parte do build. Faça backup dessa pasta.
- O limitador de tentativas (login, orçamento, contato) é em memória: adequado a **um** processo Node. Para várias
  instâncias, troque por Redis.
- Redirecione `lab81.com.br` → `www` (ou o inverso) e mantenha o mesmo domínio em `NEXT_PUBLIC_SITE_URL`.

## 5. Painel administrativo (`/admin`)

- **Orçamentos:** lista com busca e filtro, detalhe com arquivos (download seguro), status de atendimento,
  notas internas, histórico, atalhos para responder por WhatsApp/e-mail e **exportação CSV**.
- **Mensagens:** formulário de contato.
- **Projetos / Produtos / Blog:** criação e edição, upload de imagens (convertidas para WebP), texto alternativo
  obrigatório, capa, destaque, rascunho/publicado, selo "Demonstrativo", SEO por item.
- **Categorias**, **SEO das páginas** (título/description por rota) e **Configurações** (contatos, endereço, dados legais,
  materiais e cores do formulário, limite de upload).

Alterações no painel atualizam o site imediatamente (`revalidatePath`). A visão geral lista as **pendências de configuração**.

## 6. Orçamentos: como funciona

1. Formulário em 5 etapas (`/orcamento`): tipo de projeto → arquivos → detalhes → contato → resumo.
2. `POST /api/orcamento` valida origem (CSRF), limite de tentativas, honeypot, campos (zod), quantidade/tamanho dos
   arquivos e o **conteúdo real** de cada arquivo (STL binário/ASCII, OBJ, 3MF/ZIP, STEP ISO-10303-21, JPG, PNG, WEBP, PDF).
3. Arquivos são gravados com nome aleatório em `STORAGE_DIR/quotes/<protocolo>/`, fora da pasta pública. O registro
   vai para o SQLite numa transação. Se algo falhar, os arquivos são removidos e o usuário recebe erro (nunca um falso sucesso).
4. O visitante recebe o **protocolo** (`L81-AAMMDD-XXXXX`). E-mail e webhook são disparados depois da resposta e o
   resultado fica no histórico do orçamento.
5. Não há cálculo automático de preço. `src/lib/pricing.ts` define a interface para uma futura estimativa automática.

## 7. Mensuração (LGPD)

Banner de consentimento próprio. O GTM só é carregado após "Aceitar" (Consent Mode v2 com padrão negado).
Eventos no `dataLayer`: `quote_cta_click`, `quote_start`, `quote_file_upload`, `quote_submit`, `whatsapp_click`,
`project_view`, `contact_click`, `contact_submit`. Configure GA4 dentro do GTM. A origem (UTM, referrer, página de entrada)
é salva junto de cada orçamento.

## 8. Documentos

- [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md): dados reais e integrações que faltam
- [`docs/CHECKLIST-TESTES.md`](docs/CHECKLIST-TESTES.md): o que já foi verificado e o roteiro antes de publicar
- [`docs/SEO.md`](docs/SEO.md): arquitetura, palavras-chave (hipóteses a validar) e próximos passos
- [`docs/referencias/`](docs/referencias): imagens de referência usadas no projeto
