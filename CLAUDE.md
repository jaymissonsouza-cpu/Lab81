# Contexto do projeto para o Claude

@AGENTS.md

## Sobre o usuário (ler antes de responder)

- **Opera pelo celular.** Não tem computador à mão: não consegue usar terminal, SSH, colar blocos longos
  nem encontrar menus de configuração do ambiente do Claude. Dar instruções curtas, em passos de toque,
  em português do Brasil. Preferir resolver do lado do Claude/servidor a pedir ações técnicas.
- Nunca pedir tokens, senhas ou chaves no chat.
- Empresa nova (LAB81 Studio, Recife): o site vai sendo alterado e publicado continuamente.

## Publicação

- Produção = branch `main`. Cada push gera a release `producao` (GitHub Actions) e o VPS Hostinger
  (Docker, `deploy/boot.mjs`) atualiza sozinho em até 5 minutos. Detalhes em `docs/PUBLICACAO.md`.
- Fluxo de trabalho: desenvolver em `claude/lab81-website`, validar (lint, typecheck, build) e enviar para `main`.
- Domínio: `lab81studio.com.br` (registrado na Hostinger em 01/11/2026).
- VPS Hostinger KVM 2, IP `177.7.32.100`, com **EasyPanel** (usar o `Dockerfile` da raiz; ver `docs/PUBLICACAO.md`).
- O ambiente do Claude não acessa o IP do VPS (rede restrita). Para conferir o site use o endereço do EasyPanel
  `https://lab81-site.nfkqah.easypanel.host/` (acessível daqui), o domínio e o DNS público (dns.google).
- EasyPanel: projeto `lab81`, serviço `site` (fonte: Dockerfile inline com `ADD .../deploy/boot.mjs`), volume
  `lab81-data` em `/data`, domínios na porta 3000. **O mesmo VPS hospeda outros projetos do usuário
  (projeto `jaymisson`: n8n, gemelli, pgimports, catálogo etc.) — nunca alterar nada fora de `lab81`.**
- Login do painel do site: `admin@lab81studio.com.br`; a senha inicial foi gerada no 1º boot (logs do serviço) e
  está com o usuário. Nunca repetir senhas no chat.
