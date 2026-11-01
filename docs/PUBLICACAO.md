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

## VPS atual: EasyPanel (Ubuntu 24.04, KVM 2, IP 177.7.32.100)

O VPS da LAB81 veio com o **EasyPanel** (painel Docker com proxy e HTTPS próprios nas portas 80/443).
Por isso usamos o `Dockerfile` da raiz, e não o `docker-compose.yaml` com Caddy, que disputaria as portas 80/443.

No EasyPanel (http://177.7.32.100:3000):
1. Projeto `lab81` → **+ Serviço → App** (nome `site`).
2. **Fonte: Git** → `https://github.com/jaymissonsouza-cpu/Lab81.git`, branch `main`, caminho `/`.
   **Build: Dockerfile** (arquivo `Dockerfile`). Implantar.
3. **Montagens → Volume**: nome `lab81-data`, caminho `/data` (banco e arquivos; obrigatório).
4. **Domínios**: `lab81studio.com.br` e `www.lab81studio.com.br`, HTTPS ligado, porta **3000**.
5. **DNS (hPanel)**: registros A de `@` e `www` → `177.7.32.100`.
6. Senha inicial do painel do site: logs do serviço (`SENHA INICIAL DO PAINEL`); login `admin@lab81studio.com.br`.

Atualizações: automáticas (o contêiner busca a release `producao` a cada 5 min). Não é preciso reimplantar no EasyPanel.

## Primeira instalação pelo celular (sem token, sem terminal)

O compose funciona **sem nenhuma variável**: na primeira inicialização o contêiner gera o `SESSION_SECRET` e a
**senha do painel**, guarda no volume (`/data/.lab81-secrets.json`) e mostra a senha nos logs do serviço `app`
(linha `SENHA INICIAL DO PAINEL`). E-mail de login padrão: `admin@lab81studio.com.br`.

No app/site da Hostinger (hPanel):

1. **VPS → Docker Manager** → criar projeto a partir de URL (Compose) com
   `https://raw.githubusercontent.com/jaymissonsouza-cpu/Lab81/main/deploy/docker-compose.yaml`, nome `lab81`.
   Se o Docker Manager pedir para instalar o Docker ou trocar o sistema para "Ubuntu com Docker", aceitar
   (o VPS é novo; trocar o sistema apaga o conteúdo do VPS).
2. Abrir os **logs** do contêiner `app` e anotar a senha inicial.
3. **Domínios → lab81studio.com.br → DNS**: registros **A** de `@` e `www` com o IP do VPS.
   O HTTPS (Caddy + Let's Encrypt) é emitido sozinho quando o DNS propagar.

Testado em 01/11/2026 sem variáveis: senha gerada e persistente após reinício, login no painel ok, site pelo IP
na porta 80 e domínio redirecionando para HTTPS.

## Retomar a primeira publicação (checklist da sessão)

Situação em 01/11/2026: código e pipeline prontos; release "producao" sendo gerada a cada push na `main`;
contêiner validado localmente. **Faltam apenas acessos:**

1. [ ] Token da API da Hostinger disponível no ambiente do Claude (`HOSTINGER_API_TOKEN` ou segredo de rede para
       `developers.hostinger.com`). Nunca colar o token no chat.
2. [ ] Domínio `lab81studio.com.br`: em 01/11/2026 o Registro.br ainda o mostrava como **não registrado**.
       Concluir a compra/validação (CPF ou CNPJ) no hPanel → Domínios.

Com o token disponível, a sessão executa:

```bash
node scripts/hostinger.mjs status            # confirma VPS, Docker Manager e situação do domínio
ADMIN_EMAIL=jaymissonsouza@gmail.com ADMIN_PASSWORD="<gerada e entregue ao usuário>" node scripts/hostinger.mjs deploy
# site no ar em http://<IP do VPS>
node scripts/hostinger.mjs dns               # quando o domínio estiver ativo
node scripts/hostinger.mjs https             # depois que o DNS propagar
```

Se o `status` indicar que o VPS não tem Docker, a alternativa é reinstalar o VPS com o modelo "Ubuntu + Docker"
(apaga o conteúdo do VPS: confirmar com o usuário antes) ou usar `deploy/setup-vps.sh`.
