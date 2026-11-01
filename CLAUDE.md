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
