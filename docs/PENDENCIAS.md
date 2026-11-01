# Pendências: dados reais e integrações

Tudo abaixo está **implementado na estrutura**, mas depende de informação ou credencial que ainda não existe.
Nada disso é simulado no site: campos vazios simplesmente não aparecem.

## Conteúdo e identidade

| Item | Onde ajustar | Situação atual |
|---|---|---|
| Logotipo em **SVG oficial** | `public/brand/` + `src/components/site/Logo.tsx` | PNG recortado da referência (provisório) |
| **Fotografias reais** de projetos e produtos | Painel → Projetos / Produtos | 7 projetos e 4 produtos **demonstrativos**, com selo visível, usando recortes dos mockups |
| Foto do hero da home | `src/app/(site)/page.tsx` (`/demo/luminaria-parametrica-laranja.webp`) | Imagem demonstrativa com selo; trocar e remover o selo (`heroDemo = false`) |
| Imagens das páginas de serviço | `src/content/services.ts` (`image`) | Demonstrativas (com selo) |
| **Projetos reais executados** (desafio, solução, material) | Painel → Projetos | Textos demonstrativos marcados como tal |
| Preços / disponibilidade / cores dos produtos | Painel → Produtos | "Sob consulta", sem preço |
| Página **Sobre**: equipe, história, fotos do estúdio | `src/app/(site)/sobre/page.tsx` | Só o conceito da marca (nada inventado) |
| **Fotos de brindes, chaveiros e peças para empresas/restaurantes** | Painel → Projetos (categorias "Brindes e lembranças" e "Empresas e comércio" já existem) | Ainda sem itens: as categorias só aparecem no filtro do portfólio quando tiverem projetos. Não foram criados exemplos fictícios |
| Imagens das páginas Brindes e Empresas | `src/content/services.ts` | Demonstrativas, de peças decorativas/técnicas; trocar por fotos reais de chaveiros, porta-QR code etc. |
| Serviço "Design de produtos" | `src/content/services.ts` | **Não publicado** (não confirmado) |

## Dados comerciais (Painel → Configurações)

- [ ] WhatsApp (ativa botão flutuante e links)
- [ ] E-mail comercial
- [ ] Telefone
- [ ] Instagram
- [ ] Endereço (apenas se houver atendimento presencial; ativa o JSON-LD `LocalBusiness`)
- [ ] Horário de atendimento
- [ ] Razão social e CNPJ (rodapé e política de privacidade)
- [ ] **Cores de filamento disponíveis** (sem elas, o formulário mostra campo livre)
- [ ] Confirmar materiais (PLA, PETG, ABS, ASA) e o limite de upload (50 MB por arquivo 3D)

## Jurídico

- [ ] Revisar a **Política de privacidade** com assessoria jurídica (`src/app/(site)/politica-de-privacidade/page.tsx`).
  O texto atual afirma que arquivos não são compartilhados nem publicados sem autorização; confirme que essa é a prática.
- [ ] Definir prazo de retenção de dados e arquivos de orçamentos.

## Infraestrutura e integrações

| Integração | Variáveis | Observação |
|---|---|---|
| Domínio + HTTPS | `NEXT_PUBLIC_SITE_URL`, Certbot | Obrigatório antes de indexar |
| Painel admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Sem isso o login fica desativado |
| E-mail de notificação | `SMTP_*`, `QUOTE_NOTIFY_EMAIL` | Sem isso, orçamentos ficam apenas no painel |
| CRM / automação | `QUOTE_WEBHOOK_URL`, `QUOTE_WEBHOOK_SECRET` | n8n, Make, Zapier, RD Station etc. |
| Google Tag Manager + GA4 | `NEXT_PUBLIC_GTM_ID` | Criar tags GA4 dentro do GTM para os eventos listados no README |
| Search Console | `GOOGLE_SITE_VERIFICATION` | Depois, enviar `/sitemap.xml` |
| Perfil da Empresa no Google | — | Somente se a operação for elegível (endereço ou área de atendimento verificável) |
| Backups | `deploy/backup.sh` + cron | Configurar e testar restauração |
| E-commerce (futuro) | — | Produtos já têm preço, estoque, variações e disponibilidade no banco; falta escolher gateway/plataforma. Não há checkout fictício. |
| Precificação automática (futuro) | `src/lib/pricing.ts` | Interface pronta; hoje o orçamento é 100% manual |

## Antes de publicar

- [ ] Substituir ou despublicar os itens "Demonstrativo" que não representem o trabalho da LAB81
- [ ] Preencher Configurações e revisar o painel → Visão geral (lista automática de pendências)
- [ ] Rodar o roteiro de `CHECKLIST-TESTES.md` no domínio final
