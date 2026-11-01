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

## 4. Publicação

**Caminho principal (em uso): Hostinger VPS com Docker.** O servidor busca sozinho cada nova versão publicada pela
branch `main`. Guia completo e comandos em [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md).

O caminho abaixo (SSH + systemd + Nginx) continua disponível como alternativa para servidores sem Docker.

### Alternativa: VPS sem Docker (SSH + GitHub Actions)

Publicação **automática**: todo push na branch `main` passa por lint, tipos e build e, se estiver tudo certo,
vai para o servidor. Se a nova versão não responder, o servidor volta sozinho para a anterior.
As outras branches e PRs só são validadas, sem publicar.

```
push na main → GitHub Actions (lint, tipos, build) → envia release por SSH → troca a versão → teste de saúde
                                                                                   └─ falhou? reverte
```

### 4.1 Preparar o servidor (uma única vez)

Requisitos: VPS **Ubuntu 22.04 ou 24.04 (x86_64)**, 1 GB de RAM ou mais, acesso root e um domínio.

1. No servidor, como root, rode o script e responda às perguntas (domínio, e-mail e senha do painel; deixe a chave SSH vazia para ele gerar uma):
   ```bash
   curl -fsSL https://raw.githubusercontent.com/jaymissonsouza-cpu/Lab81/main/deploy/setup-vps.sh -o setup-vps.sh
   bash setup-vps.sh
   ```
   O script instala Node 22, Nginx, firewall, serviço `lab81`, backup diário às 3h e cria o `/srv/lab81/.env` com a senha
   do painel já protegida (hash) e um `SESSION_SECRET` aleatório.
2. No fim, o script imprime exatamente o que copiar para o GitHub → *Settings → Secrets and variables → Actions*:
   - **Secrets:** `VPS_HOST` (IP), `VPS_USER` = `lab81`, `VPS_SSH_KEY` (conteúdo de `lab81_deploy`, a chave **privada**),
     `VPS_KNOWN_HOSTS` (saída de `ssh-keyscan -H <IP>`)
   - **Variables:** `NEXT_PUBLIC_SITE_URL` (ex.: `https://www.lab81.com.br`) e, se houver, `NEXT_PUBLIC_GTM_ID`
3. Aponte o DNS do domínio para o IP do servidor, rode o workflow (*Actions → CI / Deploy → Run workflow*, branch `main`) e, com o DNS propagado, ative o HTTPS:
   ```bash
   certbot --nginx -d www.lab81.com.br -d lab81.com.br --redirect
   ```

### 4.2 Estrutura no servidor

```
/srv/lab81/
  .env            configuração e segredos (fora do Git)
  current ->      release ativa (link)
  releases/       últimas 5 versões publicadas
  storage/        banco SQLite, arquivos de orçamento, imagens do painel  ← nunca é apagado no deploy
  backups/        cópias diárias (14 dias)
```

Comandos úteis: `systemctl status lab81` · `journalctl -u lab81 -f` · `/usr/local/bin/lab81-backup`.
Para alterar e-mail/SMTP/webhook, edite `/srv/lab81/.env` e rode `systemctl restart lab81`.

Pontos importantes:
- Após cada deploy, as páginas são regeneradas com os dados reais do banco (`/api/revalidate`, protegido pelo `SESSION_SECRET`).
- O limitador de tentativas é em memória: adequado a **um** processo Node. Para várias instâncias, use Redis.
- `deploy/nginx.conf` e `deploy/backup.sh` são referências para configuração manual (o `setup-vps.sh` já faz tudo).

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

- [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md): como o site é publicado e atualizado no servidor
- [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md): dados reais e integrações que faltam
- [`docs/CHECKLIST-TESTES.md`](docs/CHECKLIST-TESTES.md): o que já foi verificado e o roteiro antes de publicar
- [`docs/SEO.md`](docs/SEO.md): arquitetura, palavras-chave (hipóteses a validar) e próximos passos
- [`docs/referencias/`](docs/referencias): imagens de referência usadas no projeto
