# Checklist de testes e validação

## Já verificado no desenvolvimento (01/11/2026)

**Qualidade de código**
- [x] `npm run typecheck`: sem erros
- [x] `npm run lint`: sem erros
- [x] `npm run build`: build de produção (standalone) concluído; páginas públicas pré-renderizadas (SSG/ISR)
- [x] Build não empacota `storage/`, `.env*`, `docs/` nem o código-fonte

**Fluxo de orçamento (navegador, viewport de celular 390px)**
- [x] Produto pré-selecionado via `/orcamento?produto=...`
- [x] Upload de STL e imagem; arquivo `.exe` recusado com mensagem
- [x] Validação por etapa (4 erros exibidos com campos vazios)
- [x] Envio real → protocolo exibido → registro no SQLite + arquivos no disco
- [x] Sem rolagem horizontal

**API de orçamento (requisições diretas)**
- [x] STL válido aceito (201 + protocolo)
- [x] HTML disfarçado de `.stl` recusado (validação de conteúdo)
- [x] Campos inválidos → 422 com erros por campo
- [x] Origem externa → 403
- [x] Notificações sem SMTP/webhook registradas como "skipped" (não fingem envio)

**Painel**
- [x] `/admin` sem sessão → redireciona ao login
- [x] Senha errada → mensagem; limite de tentativas bloqueia após 5 erros
- [x] Alterar status e notas → histórico registra "Novo → Em análise"
- [x] Download de arquivo autenticado funciona; sem sessão → 401
- [x] Editar projeto + enviar imagem → reflete no site público imediatamente
- [x] Formulários não perdem o que foi digitado quando há erro

**Rotas**
- [x] Todas as rotas públicas respondem 200; rota inexistente → 404 personalizada
- [x] `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
- [x] Cabeçalhos de segurança (HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy)

**Lighthouse (build de produção, localhost, perfil mobile)**

| Página | Performance | Acessibilidade | Boas práticas | SEO | CLS |
|---|---|---|---|---|---|
| `/` | 85–92 | 100 | 100 | 100 | 0 |
| `/orcamento` | 92 | 97→100* | 100 | 100 | 0 |

LCP da home no celular:
- **1,9–2,0 s** com throttling real do Chrome (4G lento + CPU 4×)
- **3,2–3,8 s** na estimativa simulada padrão do Lighthouse (Lantern), que é mais pessimista
- O elemento LCP é a imagem do hero (23 KB), que carrega rápido; o atraso estimado vem do processamento de JavaScript
  e de layout no CPU simulado.

\* Contraste dos botões corrigido após a medição.

Esses números vêm de localhost, sem latência real de rede. **Valide no domínio final** (PageSpeed Insights) e acompanhe os
dados de campo (CrUX / Search Console → Core Web Vitals).

## Roteiro antes de publicar (no domínio final)

**Funcional**
- [ ] Enviar orçamento real pelo celular (Android e iPhone), com STL de ~30 MB e foto da câmera
- [ ] Conferir chegada do e-mail/webhook (se configurados)
- [ ] Responder pelo botão de WhatsApp do painel
- [ ] Formulário de contato → mensagem no painel
- [ ] Criar, editar e despublicar um projeto, um produto e um artigo
- [ ] Testar backup **e restauração** (`deploy/backup.sh`)

**Navegadores e dispositivos**
- [ ] Chrome, Safari (macOS/iOS), Firefox, Edge
- [ ] Larguras 360, 390, 768, 1024, 1440 e 1920 px
- [ ] Navegação só por teclado (menu mobile, formulário, filtros, FAQ)
- [ ] Leitor de tela (VoiceOver/TalkBack) no formulário de orçamento
- [ ] Sistema com "reduzir movimento" ativado

**SEO**
- [ ] `NEXT_PUBLIC_SITE_URL` correto; canonicals apontando para o domínio com HTTPS
- [ ] Rich Results Test em `/`, uma página de serviço, um artigo e um projeto
- [ ] Enviar sitemap no Search Console; inspecionar URLs principais
- [ ] Redirecionamento único `http`/sem `www` → domínio canônico

**Performance**
- [ ] PageSpeed Insights (mobile e desktop) da home, `/orcamento`, um serviço e um projeto
- [ ] Após trocar as fotos reais: imagens com boa resolução (≥ 1600 px de largura no hero)

**Mensuração**
- [ ] GTM Preview: eventos disparam somente após "Aceitar"
- [ ] "Recusar" não carrega o GTM; "Preferências de cookies" no rodapé reabre o banner
