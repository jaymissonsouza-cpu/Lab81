# SEO — arquitetura e próximos passos

Nenhuma posição em buscadores é prometida. O site oferece a base técnica e editorial para ser encontrado.

## Implementado

- Páginas públicas pré-renderizadas (SSG/ISR com revalidação), HTML semântico, **um H1 por página**, hierarquia H2/H3
- Título e meta description exclusivos por página (editáveis em Painel → SEO das páginas e em cada projeto/produto/artigo)
- URLs amigáveis em português, canonical, Open Graph e Twitter Card, `lang="pt-BR"`
- `sitemap.xml` (com imagens de projetos/produtos) e `robots.txt` (bloqueia `/admin`, `/api`, confirmação)
- Breadcrumbs visíveis + JSON-LD `BreadcrumbList`
- JSON-LD: `Organization` e `WebSite` (global), `Service` (páginas de serviço), `BlogPosting` (artigos),
  `CreativeWork` (projetos). `LocalBusiness` **só** quando houver endereço real cadastrado.
  Não há avaliações, notas, horários ou endereço fictícios.
- Imagens via `next/image` (AVIF/WebP, `sizes`), alt descritivo obrigatório no painel
- Página 404, redirecionamentos (`/portfolio` → `/projetos`, `/loja` → `/produtos` etc.), HTTPS/HSTS
- Links internos contextuais: serviços ↔ artigos ↔ projetos ↔ orçamento

## Rotas

| Rota | Intenção principal (hipótese) |
|---|---|
| `/` | marca + impressão 3D Recife |
| `/impressao-3d-recife` | impressão 3D Recife / Pernambuco (local) |
| `/impressao-3d-personalizada` | impressão 3D personalizada, sob demanda, peças funcionais, PLA |
| `/brindes-personalizados` | chaveiros personalizados, lembrancinhas, brindes 3D, brindes com logomarca |
| `/solucoes-para-empresas` | impressão 3D para empresas, porta-QR code, displays para restaurante |
| `/modelagem-3d` | modelagem 3D para impressão |
| `/prototipagem-3d` | prototipagem 3D |
| `/orcamento` | orçamento impressão 3D |
| `/projetos`, `/projetos/[slug]` | peças impressas em 3D (prova de trabalho) |
| `/produtos`, `/produtos/[slug]` | produtos autorais |
| `/blog`, `/blog/[slug]` | dúvidas informacionais |
| `/servicos`, `/sobre`, `/contato` | navegação e institucional |

Não foram criadas páginas por bairro, para evitar conteúdo repetitivo.

## Palavras-chave: hipóteses a validar

Impressão 3D Recife · impressão 3D em Pernambuco · impressão 3D personalizada · serviço de impressão 3D ·
orçamento impressão 3D · modelagem 3D · prototipagem 3D · peças impressas em 3D · impressão 3D sob demanda ·
impressão 3D em PLA · fabricação de peças personalizadas · chaveiro personalizado Recife · lembrancinhas personalizadas ·
brindes personalizados com logo · porta QR code para mesa · display para restaurante.

**Ainda não validadas** (volume, intenção e concorrência). Sugestão:
1. Google Keyword Planner (local: Recife/PE) e Google Trends
2. Analisar a SERP de cada termo: quem ranqueia, que tipo de página, se há pacote local (Maps)
3. Após 4 a 8 semanas no ar, usar as consultas reais do Search Console para ajustar títulos e criar conteúdo

## Blog: 9 artigos iniciais publicados

Quanto custa uma impressão 3D? · Como funciona a impressão 3D? · PLA ou PETG · Como encomendar uma peça ·
O que é prototipagem 3D · Quais arquivos são usados · Como preparar um modelo · Quando vale fabricar sob demanda ·
Brindes e chaveiros personalizados em impressão 3D.
O conteúdo é original, sem preços nem estatísticas inventados, e pode ser editado no painel.

Próximas pautas sugeridas: ABS ou ASA para uso externo; Peça de reposição impressa em 3D (com casos reais);
Guia de tolerâncias de encaixe; Acabamentos possíveis em peças FDM.

## SEO local

- Exibir NAP (nome, endereço, telefone) idêntico no site, no Perfil da Empresa no Google e nas redes
- Criar o Perfil da Empresa apenas se elegível. Sem endereço público, use "empresa de área de atendimento"
- Pedir avaliações reais a clientes (nunca inserir avaliações no site sem fonte verificável)
