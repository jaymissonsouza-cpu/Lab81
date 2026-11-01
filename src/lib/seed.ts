import type Database from "better-sqlite3";
import { BLOG_POSTS, BLOG_POSTS_V2 } from "@/content/blog";
import { AREAS, PRODUCTS_V3, PRODUCT_CATEGORIES_V3, PROJECTS_V3 } from "@/content/solucoes";

/**
 * Conteúdo inicial. Executado uma única vez (marcador "seed_version" em settings).
 * Projetos e produtos marcados como is_demo = 1 usam imagens DEMONSTRATIVAS recortadas
 * das referências visuais e devem ser substituídos por trabalhos reais no painel.
 */


export const DEFAULT_SETTINGS: Record<string, string> = {
  whatsapp: "",
  phone: "",
  email: "",
  instagram: "",
  address: "",
  city: "Recife",
  region: "PE",
  service_area: "Atendimento em Recife e Região Metropolitana. Envio para outras regiões conforme capacidade operacional.",
  business_hours: "",
  legal_name: "",
  cnpj: "",
  materials: JSON.stringify(["PLA", "PETG", "ABS", "ASA"]),
  colors: JSON.stringify([]),
  max_model_mb: "50",
};

const PROJECT_CATEGORIES = [
  ["decoracao", "Decoração"],
  ["pecas-tecnicas", "Peças técnicas"],
  ["prototipos", "Protótipos"],
  ["personalizados", "Personalizados"],
];
const PRODUCT_CATEGORIES = [
  ["luminarias", "Luminárias"],
  ["vasos-e-esculturas", "Vasos e esculturas"],
  ["organizacao", "Organização"],
];

const img = (src: string, alt: string) => ({ src, alt });

const DEMO_PROJECTS = [
  {
    slug: "luminaria-parametrica",
    title: "Luminária Paramétrica",
    category: "decoracao",
    material: "PLA",
    application: "Iluminação decorativa",
    summary: "Cúpula de lâminas onduladas que filtram a luz e criam um desenho de sombras sobre o ambiente.",
    challenge: "Criar uma peça de iluminação com aparência escultórica, leve e sem suportes internos aparentes.",
    solution: "Geometria paramétrica com lâminas contínuas, pensada para imprimir sem suportes e receber uma fonte de luz LED de baixo aquecimento.",
    description: "Exemplo do tipo de objeto decorativo que pode ser desenvolvido e fabricado no estúdio: forma gerada por parâmetros, ajustável em altura, diâmetro e número de lâminas.",
    images: [
      img("/demo/luminaria-parametrica-laranja.webp", "Luminária paramétrica laranja impressa em 3D, com lâminas onduladas iluminadas por dentro"),
      img("/demo/luminaria-detalhe-vertical.webp", "Detalhe da luminária paramétrica laranja sobre base de pedra escura"),
    ],
    featured: 1,
  },
  {
    slug: "suporte-tecnico",
    title: "Suporte Técnico",
    category: "pecas-tecnicas",
    material: "PETG",
    application: "Fixação e montagem",
    summary: "Suporte estrutural com nervuras e furos de fixação para uso funcional.",
    challenge: "Substituir uma peça de fixação sem disponibilidade no mercado, mantendo resistência e encaixe.",
    solution: "Modelagem a partir de medidas, nervuras de reforço e orientação de impressão escolhida para favorecer a resistência no sentido da carga.",
    description: "Exemplo de peça técnica: medidas tiradas do item original, modelagem em CAD e fabricação em material adequado ao esforço.",
    images: [
      img("/demo/suporte-tecnico-preto.webp", "Suporte técnico preto impresso em 3D com nervuras e furos de fixação"),
      img("/demo/suporte-tecnico-preto-2.webp", "Outra vista do suporte técnico preto sobre bancada"),
    ],
    featured: 1,
  },
  {
    slug: "carcaca-aerodinamica",
    title: "Carcaça Aerodinâmica",
    category: "prototipos",
    material: "PETG",
    application: "Protótipo de forma e encaixe",
    summary: "Estrutura vazada em padrão hexagonal para validar forma, ventilação e peso.",
    challenge: "Validar rapidamente a forma de uma carcaça antes de investir em molde ou produção em série.",
    solution: "Protótipo impresso com treliça hexagonal, permitindo avaliar ergonomia, ventilação e montagem em poucos dias.",
    description: "Exemplo de prototipagem: iterações físicas rápidas para testar uma ideia antes de produzir em escala.",
    images: [
      img("/demo/carcaca-aerodinamica-laranja.webp", "Carcaça aerodinâmica laranja impressa em 3D com estrutura hexagonal vazada"),
      img("/demo/carcaca-aerodinamica-2.webp", "Vista lateral da carcaça aerodinâmica laranja"),
    ],
    featured: 1,
  },
  {
    slug: "vaso-escultural",
    title: "Vaso Escultural",
    category: "decoracao",
    material: "PLA",
    application: "Decoração",
    summary: "Vaso de linhas torcidas com acabamento em tom areia.",
    challenge: "Desenvolver uma peça decorativa com movimento visual e textura de camadas aparente.",
    solution: "Superfície helicoidal contínua, impressa em modo de parede única para valorizar o efeito das camadas.",
    description: "Exemplo de peça autoral decorativa, que pode ser reproduzida em outras cores e tamanhos.",
    images: [img("/demo/vaso-escultural-areia.webp", "Vaso escultural em tom areia com linhas torcidas impresso em 3D")],
    featured: 0,
  },
  {
    slug: "organizador-modular",
    title: "Organizador Modular",
    category: "personalizados",
    material: "PLA",
    application: "Organização e decoração",
    summary: "Peça vazada em padrão orgânico, pensada para ser personalizada em medida e cor.",
    challenge: "Criar um objeto útil que pudesse ser adaptado ao espaço e ao estilo de cada cliente.",
    solution: "Modelo paramétrico com dimensões ajustáveis e padrão vazado que reduz material e tempo de impressão.",
    description: "Exemplo de produto personalizado sob medida.",
    images: [
      img("/demo/organizador-modular-areia.webp", "Organizador modular em tom areia com padrão vazado orgânico"),
      img("/demo/luminaria-parametrica-areia.webp", "Peça vazada em tom areia com padrão de losangos"),
    ],
    featured: 0,
  },
  {
    slug: "peca-funcional",
    title: "Peça Funcional",
    category: "pecas-tecnicas",
    material: "ASA",
    application: "Reposição e uso externo",
    summary: "Peça de reposição com furos de montagem, para uso em ambiente com sol e calor.",
    challenge: "Produzir uma peça de reposição que suportasse exposição ao sol sem deformar.",
    solution: "Escolha de material com melhor resistência a UV e temperatura e paredes reforçadas nas áreas de fixação.",
    description: "Exemplo de peça funcional sob demanda.",
    images: [img("/demo/peca-funcional-preta.webp", "Peça funcional preta impressa em 3D com furos de montagem")],
    featured: 0,
  },
  {
    slug: "luminaria-helicoidal",
    title: "Luminária Helicoidal",
    category: "decoracao",
    material: "PLA",
    application: "Iluminação decorativa",
    summary: "Variação da luminária paramétrica com lâminas em espiral.",
    challenge: "Explorar uma variação de forma da mesma família de luminárias.",
    solution: "Alteração dos parâmetros de torção e altura, mantendo a base de encaixe da família.",
    description: "Exemplo de como um único modelo paramétrico gera uma linha inteira de produtos.",
    images: [img("/demo/luminaria-torcida-laranja.webp", "Luminária helicoidal laranja impressa em 3D com lâminas em espiral")],
    featured: 0,
  },
];

const DEMO_PRODUCTS = [
  {
    slug: "luminaria-parametrica",
    name: "Luminária Paramétrica",
    category: "luminarias",
    summary: "Luminária de mesa com lâminas onduladas que desenham luz e sombra.",
    description:
      "Peça autoral de iluminação decorativa. A forma é gerada por parâmetros, o que permite ajustar altura, diâmetro e número de lâminas. Produzida sob encomenda.",
    materials: ["PLA"],
    colors: [],
    sizes: [],
    customizable: 1,
    images: [
      img("/demo/luminaria-parametrica-laranja.webp", "Luminária paramétrica laranja acesa sobre base de pedra"),
      img("/demo/luminaria-detalhe-vertical.webp", "Detalhe das lâminas da luminária paramétrica"),
    ],
  },
  {
    slug: "luminaria-helicoidal",
    name: "Luminária Helicoidal",
    category: "luminarias",
    summary: "Variação em espiral da luminária paramétrica.",
    description: "Mesma família da Luminária Paramétrica, com lâminas torcidas em hélice. Produzida sob encomenda.",
    materials: ["PLA"],
    colors: [],
    sizes: [],
    customizable: 1,
    images: [img("/demo/luminaria-torcida-laranja.webp", "Luminária helicoidal laranja com lâminas em espiral")],
  },
  {
    slug: "vaso-escultural",
    name: "Vaso Escultural",
    category: "vasos-e-esculturas",
    summary: "Vaso decorativo de linhas torcidas e textura de camadas.",
    description: "Peça decorativa autoral. Indicada para arranjos secos e decoração; consulte o uso com água antes de encomendar.",
    materials: ["PLA"],
    colors: [],
    sizes: [],
    customizable: 1,
    images: [img("/demo/vaso-escultural-areia.webp", "Vaso escultural em tom areia")],
  },
  {
    slug: "organizador-modular",
    name: "Organizador Modular",
    category: "organizacao",
    summary: "Organizador vazado, ajustável em medida e cor.",
    description: "Peça paramétrica que pode ser produzida em diferentes dimensões para se adaptar ao seu espaço.",
    materials: ["PLA", "PETG"],
    colors: [],
    sizes: [],
    customizable: 1,
    images: [img("/demo/organizador-modular-areia.webp", "Organizador modular vazado em tom areia")],
  },
];

/**
 * Etapas incrementais: cada uma roda uma única vez (controle por settings.seed_version).
 * Nunca altere uma etapa já publicada; adicione uma nova. Assim, itens apagados no painel não voltam.
 */
const STEPS: ((db: Database.Database) => void)[] = [seedV1, seedV2, seedV3];

export function seedDatabase(db: Database.Database) {
  const read = () =>
    Number((db.prepare("SELECT value FROM settings WHERE key = 'seed_version'").get() as { value: string } | undefined)?.value ?? 0) || 0;
  if (read() >= STEPS.length) return;
  db.transaction(() => {
    const current = read(); // relido dentro do lock (outro processo pode ter acabado de popular)
    if (current >= STEPS.length) return;
    for (let v = current; v < STEPS.length; v++) STEPS[v](db);
    db.prepare("INSERT INTO settings (key, value) VALUES ('seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
      String(STEPS.length),
    );
  }).immediate();
}

/**
 * v3 — novo posicionamento ("Não é só impressão 3D. É solução."): soluções por área com as artes oficiais.
 * Remove apenas os itens demonstrativos originais que continuam intactos (is_demo = 1);
 * nada criado ou editado no painel é apagado.
 */
function seedV3(db: Database.Database) {
  const oldProjects = DEMO_PROJECTS.map((p) => p.slug);
  const oldProducts = DEMO_PRODUCTS.map((p) => p.slug);
  const ph = (n: number) => Array(n).fill("?").join(",");
  db.prepare(`DELETE FROM projects WHERE is_demo = 1 AND slug IN (${ph(oldProjects.length)})`).run(...oldProjects);
  db.prepare(`DELETE FROM products WHERE is_demo = 1 AND slug IN (${ph(oldProducts.length)})`).run(...oldProducts);

  const upCat = db.prepare(
    "INSERT INTO categories (type, slug, name, sort) VALUES (?, ?, ?, ?) ON CONFLICT(type, slug) DO UPDATE SET name = excluded.name, sort = excluded.sort",
  );
  for (const a of AREAS) upCat.run("project", a.slug, a.name, a.sort);
  for (const c of PRODUCT_CATEGORIES_V3) upCat.run("product", c.slug, c.name, c.sort);
  // categorias antigas que ficaram vazias
  db.prepare(
    `DELETE FROM categories WHERE type = 'project' AND slug IN ('decoracao','personalizados','brindes-e-lembrancas')
     AND slug NOT IN (SELECT category FROM projects)`,
  ).run();
  db.prepare(
    `DELETE FROM categories WHERE type = 'product' AND slug IN ('luminarias','vasos-e-esculturas','organizacao','chaveiros-e-lembrancas')
     AND slug NOT IN (SELECT category FROM products)`,
  ).run();

  const proj = db.prepare(`INSERT OR IGNORE INTO projects
    (slug, title, category, material, application, summary, challenge, solution, description, images, featured, published, is_demo, sort)
    VALUES (@slug, @title, @category, @material, @application, @summary, @challenge, @solution, @description, @images, @featured, 1, 0, @sort)`);
  PROJECTS_V3.forEach((p, i) => proj.run({ ...p, images: JSON.stringify(p.images), sort: i }));

  const prod = db.prepare(`INSERT OR IGNORE INTO products
    (slug, name, category, summary, description, materials, colors, sizes, customizable, availability, images, published, is_demo, sort)
    VALUES (@slug, @name, @category, @summary, @description, @materials, '[]', '[]', 1, 'sob_encomenda', @images, 1, 0, @sort)`);
  PRODUCTS_V3.forEach((p, i) => prod.run({ ...p, materials: JSON.stringify(p.materials), images: JSON.stringify(p.images), sort: i }));
}

/** v2 — amplia o posicionamento: brindes/lembranças e soluções para empresas. */
function seedV2(db: Database.Database) {
  const cat = db.prepare("INSERT OR IGNORE INTO categories (type, slug, name, sort) VALUES (?, ?, ?, ?)");
  cat.run("project", "brindes-e-lembrancas", "Brindes e lembranças", 4);
  cat.run("project", "empresas", "Empresas e comércio", 5);
  cat.run("product", "chaveiros-e-lembrancas", "Chaveiros e lembranças", 3);
  const post = db.prepare(`INSERT OR IGNORE INTO posts
    (slug, title, excerpt, content, published, published_at, seo_title, seo_description)
    VALUES (@slug, @title, @excerpt, @content, 1, @published_at, @seo_title, @seo_description)`);
  for (const p of BLOG_POSTS_V2) post.run(p);
}

function seedV1(db: Database.Database) {
  {
    const setSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) setSetting.run(k, v);

    const cat = db.prepare("INSERT OR IGNORE INTO categories (type, slug, name, sort) VALUES (?, ?, ?, ?)");
    PROJECT_CATEGORIES.forEach(([slug, name], i) => cat.run("project", slug, name, i));
    PRODUCT_CATEGORIES.forEach(([slug, name], i) => cat.run("product", slug, name, i));

    const proj = db.prepare(`INSERT OR IGNORE INTO projects
      (slug, title, category, material, application, summary, challenge, solution, description, images, featured, published, is_demo, sort)
      VALUES (@slug, @title, @category, @material, @application, @summary, @challenge, @solution, @description, @images, @featured, 1, 1, @sort)`);
    DEMO_PROJECTS.forEach((p, i) => proj.run({ ...p, images: JSON.stringify(p.images), sort: i }));

    const prod = db.prepare(`INSERT OR IGNORE INTO products
      (slug, name, category, summary, description, materials, colors, sizes, customizable, availability, images, published, is_demo, sort)
      VALUES (@slug, @name, @category, @summary, @description, @materials, @colors, @sizes, @customizable, 'sob_consulta', @images, 1, 1, @sort)`);
    DEMO_PRODUCTS.forEach((p, i) =>
      prod.run({
        ...p,
        materials: JSON.stringify(p.materials),
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        images: JSON.stringify(p.images),
        sort: i,
      }),
    );

    const post = db.prepare(`INSERT OR IGNORE INTO posts
      (slug, title, excerpt, content, published, published_at, seo_title, seo_description)
      VALUES (@slug, @title, @excerpt, @content, 1, @published_at, @seo_title, @seo_description)`);
    for (const p of BLOG_POSTS) post.run(p);

  }
}
