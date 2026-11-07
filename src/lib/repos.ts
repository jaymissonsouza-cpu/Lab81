import "server-only";
import { db, parseJson } from "./db";

/* ─────────────── Tipos ─────────────── */

export type ImageRef = { src: string; alt: string };

export type Settings = {
  whatsapp: string;
  phone: string;
  email: string;
  instagram: string;
  address: string;
  city: string;
  region: string;
  service_area: string;
  business_hours: string;
  legal_name: string;
  cnpj: string;
  materials: string[];
  colors: string[];
  max_model_mb: number;
};

export type Category = { id: number; type: "project" | "product"; slug: string; name: string; sort: number };

export type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  material: string;
  application: string;
  summary: string;
  challenge: string;
  solution: string;
  description: string;
  images: ImageRef[];
  featured: boolean;
  published: boolean;
  is_demo: boolean;
  seo_title: string;
  seo_description: string;
  sort: number;
  updated_at: string;
};

export type Availability = "sob_consulta" | "sob_encomenda" | "pronta_entrega" | "indisponivel";
export const AVAILABILITY_LABEL: Record<Availability, string> = {
  sob_consulta: "Sob consulta",
  sob_encomenda: "Sob encomenda",
  pronta_entrega: "Pronta entrega",
  indisponivel: "Indisponível no momento",
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  materials: string[];
  colors: string[];
  sizes: string[];
  customizable: boolean;
  availability: Availability;
  price_cents: number | null;
  show_price: boolean;
  stock: number | null;
  images: ImageRef[];
  published: boolean;
  is_demo: boolean;
  seo_title: string;
  seo_description: string;
  sort: number;
  updated_at: string;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  cover_alt: string;
  published: boolean;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export const QUOTE_STATUSES = {
  novo: "Novo",
  em_analise: "Em análise",
  aguardando_cliente: "Aguardando cliente",
  proposta_enviada: "Proposta enviada",
  aprovado: "Aprovado",
  em_producao: "Em produção",
  concluido: "Concluído",
  cancelado: "Cancelado",
} as const;
export type QuoteStatus = keyof typeof QUOTE_STATUSES;

export type Quote = {
  id: number;
  protocol: string;
  status: QuoteStatus;
  project_type: string;
  description: string;
  dimensions: string;
  material: string;
  colors: string[];
  quantity: number;
  deadline: string;
  notes: string;
  product_slug: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  contact_preference: string;
  consent_at: string;
  source: Record<string, string>;
  internal_notes: string;
  created_at: string;
  updated_at: string;
};

export type QuoteFile = {
  id: number;
  quote_id: number;
  kind: "model" | "reference";
  original_name: string;
  stored_name: string;
  mime: string;
  size: number;
  created_at: string;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "novo" | "respondido" | "arquivado";
  created_at: string;
};

/* ─────────────── Mapeadores ─────────────── */

type Row = Record<string, unknown>;
const bool = (v: unknown) => v === 1 || v === true;

function toProject(r: Row): Project {
  return {
    ...(r as unknown as Project),
    images: parseJson<ImageRef[]>(r.images as string, []),
    featured: bool(r.featured),
    published: bool(r.published),
    is_demo: bool(r.is_demo),
  };
}

function toProduct(r: Row): Product {
  return {
    ...(r as unknown as Product),
    materials: parseJson<string[]>(r.materials as string, []),
    colors: parseJson<string[]>(r.colors as string, []),
    sizes: parseJson<string[]>(r.sizes as string, []),
    images: parseJson<ImageRef[]>(r.images as string, []),
    customizable: bool(r.customizable),
    show_price: bool(r.show_price),
    published: bool(r.published),
    is_demo: bool(r.is_demo),
  };
}

function toPost(r: Row): Post {
  return { ...(r as unknown as Post), published: bool(r.published) };
}

function toQuote(r: Row): Quote {
  return {
    ...(r as unknown as Quote),
    colors: parseJson<string[]>(r.colors as string, []),
    source: parseJson<Record<string, string>>(r.source as string, {}),
  };
}

/* ─────────────── Configurações ─────────────── */

export function getSettings(): Settings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    whatsapp: m.whatsapp ?? "",
    phone: m.phone ?? "",
    email: m.email ?? "",
    instagram: m.instagram ?? "",
    address: m.address ?? "",
    city: m.city ?? "Recife",
    region: m.region ?? "PE",
    service_area: m.service_area ?? "",
    business_hours: m.business_hours ?? "",
    legal_name: m.legal_name ?? "",
    cnpj: m.cnpj ?? "",
    materials: parseJson<string[]>(m.materials, []),
    colors: parseJson<string[]>(m.colors, []),
    max_model_mb: Math.min(100, Math.max(5, Number(m.max_model_mb) || 50)),
  };
}

export function saveSettings(values: Record<string, string>) {
  const stmt = db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  db().transaction(() => {
    for (const [k, v] of Object.entries(values)) stmt.run(k, v);
  })();
}

/* ─────────────── SEO por página ─────────────── */

export function getPageSeo(path: string): { title: string; description: string } | null {
  const row = db().prepare("SELECT title, description FROM page_seo WHERE path = ?").get(path) as
    | { title: string; description: string }
    | undefined;
  return row ?? null;
}
export function listPageSeo() {
  return db().prepare("SELECT path, title, description FROM page_seo").all() as { path: string; title: string; description: string }[];
}
export function savePageSeo(path: string, title: string, description: string) {
  db()
    .prepare(
      "INSERT INTO page_seo (path, title, description) VALUES (?, ?, ?) ON CONFLICT(path) DO UPDATE SET title = excluded.title, description = excluded.description",
    )
    .run(path, title, description);
}

/* ─────────────── Categorias ─────────────── */

export function listCategories(type: "project" | "product"): Category[] {
  return db().prepare("SELECT * FROM categories WHERE type = ? ORDER BY sort, name").all(type) as Category[];
}
export function upsertCategory(c: { id?: number; type: "project" | "product"; slug: string; name: string; sort: number }) {
  if (c.id) {
    db().prepare("UPDATE categories SET slug = ?, name = ?, sort = ? WHERE id = ?").run(c.slug, c.name, c.sort, c.id);
  } else {
    db().prepare("INSERT INTO categories (type, slug, name, sort) VALUES (?, ?, ?, ?)").run(c.type, c.slug, c.name, c.sort);
  }
}
export function deleteCategory(id: number) {
  const cat = db().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
  if (!cat) return { ok: false, reason: "Categoria não encontrada." };
  const table = cat.type === "project" ? "projects" : "products";
  const used = db().prepare(`SELECT COUNT(*) n FROM ${table} WHERE category = ?`).get(cat.slug) as { n: number };
  if (used.n > 0) return { ok: false, reason: `Categoria em uso por ${used.n} item(ns).` };
  db().prepare("DELETE FROM categories WHERE id = ?").run(id);
  return { ok: true as const };
}

/* ─────────────── Projetos ─────────────── */

export function listProjects(opts: { publishedOnly?: boolean } = {}): Project[] {
  const where = opts.publishedOnly ? "WHERE published = 1" : "";
  return (db().prepare(`SELECT * FROM projects ${where} ORDER BY featured DESC, sort, id DESC`).all() as Row[]).map(toProject);
}
export function getProject(slug: string, opts: { publishedOnly?: boolean } = {}): Project | null {
  const r = db()
    .prepare(`SELECT * FROM projects WHERE slug = ? ${opts.publishedOnly ? "AND published = 1" : ""}`)
    .get(slug) as Row | undefined;
  return r ? toProject(r) : null;
}
export function getProjectById(id: number): Project | null {
  const r = db().prepare("SELECT * FROM projects WHERE id = ?").get(id) as Row | undefined;
  return r ? toProject(r) : null;
}
export function saveProject(p: Omit<Project, "id" | "updated_at"> & { id?: number }) {
  const params = {
    ...p,
    images: JSON.stringify(p.images),
    featured: p.featured ? 1 : 0,
    published: p.published ? 1 : 0,
    is_demo: p.is_demo ? 1 : 0,
  };
  if (p.id) {
    db()
      .prepare(
        `UPDATE projects SET slug=@slug, title=@title, category=@category, material=@material, application=@application,
         summary=@summary, challenge=@challenge, solution=@solution, description=@description, images=@images,
         featured=@featured, published=@published, is_demo=@is_demo, seo_title=@seo_title, seo_description=@seo_description,
         sort=@sort, updated_at=datetime('now') WHERE id=@id`,
      )
      .run(params);
    return p.id;
  }
  const res = db()
    .prepare(
      `INSERT INTO projects (slug, title, category, material, application, summary, challenge, solution, description, images,
       featured, published, is_demo, seo_title, seo_description, sort)
       VALUES (@slug, @title, @category, @material, @application, @summary, @challenge, @solution, @description, @images,
       @featured, @published, @is_demo, @seo_title, @seo_description, @sort)`,
    )
    .run(params);
  return Number(res.lastInsertRowid);
}
export function deleteProject(id: number) {
  db().prepare("DELETE FROM projects WHERE id = ?").run(id);
}

/* ─────────────── Produtos ─────────────── */

export function listProducts(opts: { publishedOnly?: boolean } = {}): Product[] {
  const where = opts.publishedOnly ? "WHERE published = 1" : "";
  return (db().prepare(`SELECT * FROM products ${where} ORDER BY sort, id DESC`).all() as Row[]).map(toProduct);
}
export function getProduct(slug: string, opts: { publishedOnly?: boolean } = {}): Product | null {
  const r = db()
    .prepare(`SELECT * FROM products WHERE slug = ? ${opts.publishedOnly ? "AND published = 1" : ""}`)
    .get(slug) as Row | undefined;
  return r ? toProduct(r) : null;
}
export function getProductById(id: number): Product | null {
  const r = db().prepare("SELECT * FROM products WHERE id = ?").get(id) as Row | undefined;
  return r ? toProduct(r) : null;
}
export function saveProduct(p: Omit<Product, "id" | "updated_at"> & { id?: number }) {
  const params = {
    ...p,
    materials: JSON.stringify(p.materials),
    colors: JSON.stringify(p.colors),
    sizes: JSON.stringify(p.sizes),
    images: JSON.stringify(p.images),
    customizable: p.customizable ? 1 : 0,
    show_price: p.show_price ? 1 : 0,
    published: p.published ? 1 : 0,
    is_demo: p.is_demo ? 1 : 0,
  };
  if (p.id) {
    db()
      .prepare(
        `UPDATE products SET slug=@slug, name=@name, category=@category, summary=@summary, description=@description,
         materials=@materials, colors=@colors, sizes=@sizes, customizable=@customizable, availability=@availability,
         price_cents=@price_cents, show_price=@show_price, stock=@stock, images=@images, published=@published,
         is_demo=@is_demo, seo_title=@seo_title, seo_description=@seo_description, sort=@sort, updated_at=datetime('now')
         WHERE id=@id`,
      )
      .run(params);
    return p.id;
  }
  const res = db()
    .prepare(
      `INSERT INTO products (slug, name, category, summary, description, materials, colors, sizes, customizable, availability,
       price_cents, show_price, stock, images, published, is_demo, seo_title, seo_description, sort)
       VALUES (@slug, @name, @category, @summary, @description, @materials, @colors, @sizes, @customizable, @availability,
       @price_cents, @show_price, @stock, @images, @published, @is_demo, @seo_title, @seo_description, @sort)`,
    )
    .run(params);
  return Number(res.lastInsertRowid);
}
export function deleteProduct(id: number) {
  db().prepare("DELETE FROM products WHERE id = ?").run(id);
}

/* ─────────────── Blog ─────────────── */

export function listPosts(opts: { publishedOnly?: boolean } = {}): Post[] {
  const where = opts.publishedOnly ? "WHERE published = 1 AND (published_at IS NULL OR published_at <= date('now'))" : "";
  return (db().prepare(`SELECT * FROM posts ${where} ORDER BY COALESCE(published_at, created_at) DESC, id DESC`).all() as Row[]).map(
    toPost,
  );
}
export function getPost(slug: string, opts: { publishedOnly?: boolean } = {}): Post | null {
  const r = db()
    .prepare(
      `SELECT * FROM posts WHERE slug = ? ${opts.publishedOnly ? "AND published = 1 AND (published_at IS NULL OR published_at <= date('now'))" : ""}`,
    )
    .get(slug) as Row | undefined;
  return r ? toPost(r) : null;
}
export function getPostById(id: number): Post | null {
  const r = db().prepare("SELECT * FROM posts WHERE id = ?").get(id) as Row | undefined;
  return r ? toPost(r) : null;
}
export function savePost(p: Omit<Post, "id" | "updated_at"> & { id?: number }) {
  const params = { ...p, published: p.published ? 1 : 0 };
  if (p.id) {
    db()
      .prepare(
        `UPDATE posts SET slug=@slug, title=@title, excerpt=@excerpt, content=@content, cover=@cover, cover_alt=@cover_alt,
         published=@published, published_at=@published_at, seo_title=@seo_title, seo_description=@seo_description,
         updated_at=datetime('now') WHERE id=@id`,
      )
      .run(params);
    return p.id;
  }
  const res = db()
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, cover, cover_alt, published, published_at, seo_title, seo_description)
       VALUES (@slug, @title, @excerpt, @content, @cover, @cover_alt, @published, @published_at, @seo_title, @seo_description)`,
    )
    .run(params);
  return Number(res.lastInsertRowid);
}
export function deletePost(id: number) {
  db().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

/* ─────────────── Orçamentos ─────────────── */

export type NewQuote = Omit<Quote, "id" | "status" | "internal_notes" | "created_at" | "updated_at">;

export function createQuote(q: NewQuote, files: Omit<QuoteFile, "id" | "quote_id" | "created_at">[]) {
  const d = db();
  return d.transaction(() => {
    const res = d
      .prepare(
        `INSERT INTO quotes (protocol, project_type, description, dimensions, material, colors, quantity, deadline, notes,
         product_slug, name, company, email, phone, city, contact_preference, consent_at, source)
         VALUES (@protocol, @project_type, @description, @dimensions, @material, @colors, @quantity, @deadline, @notes,
         @product_slug, @name, @company, @email, @phone, @city, @contact_preference, @consent_at, @source)`,
      )
      .run({ ...q, colors: JSON.stringify(q.colors), source: JSON.stringify(q.source) });
    const id = Number(res.lastInsertRowid);
    const ins = d.prepare(
      "INSERT INTO quote_files (quote_id, kind, original_name, stored_name, mime, size) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const f of files) ins.run(id, f.kind, f.original_name, f.stored_name, f.mime, f.size);
    d.prepare("INSERT INTO quote_events (quote_id, type, detail) VALUES (?, 'criado', 'Solicitação recebida pelo site')").run(id);
    return id;
  })();
}

export function protocolExists(protocol: string) {
  return !!db().prepare("SELECT 1 FROM quotes WHERE protocol = ?").get(protocol);
}

export function listQuotes(opts: { status?: string; q?: string } = {}): Quote[] {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts.status && opts.status in QUOTE_STATUSES) {
    clauses.push("status = ?");
    params.push(opts.status);
  }
  if (opts.q) {
    clauses.push("(protocol LIKE ? OR name LIKE ? OR email LIKE ? OR company LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return (db().prepare(`SELECT * FROM quotes ${where} ORDER BY created_at DESC, id DESC LIMIT 500`).all(...params) as Row[]).map(toQuote);
}

export function getQuote(id: number) {
  const r = db().prepare("SELECT * FROM quotes WHERE id = ?").get(id) as Row | undefined;
  if (!r) return null;
  const files = db().prepare("SELECT * FROM quote_files WHERE quote_id = ? ORDER BY kind, id").all(id) as QuoteFile[];
  const events = db().prepare("SELECT * FROM quote_events WHERE quote_id = ? ORDER BY id DESC").all(id) as {
    id: number;
    type: string;
    detail: string;
    created_at: string;
  }[];
  return { quote: toQuote(r), files, events };
}

export function getQuoteFile(id: number) {
  return db()
    .prepare("SELECT f.*, q.protocol FROM quote_files f JOIN quotes q ON q.id = f.quote_id WHERE f.id = ?")
    .get(id) as (QuoteFile & { protocol: string }) | undefined;
}

export function updateQuote(id: number, status: QuoteStatus, internal_notes: string) {
  const d = db();
  d.transaction(() => {
    const prev = d.prepare("SELECT status FROM quotes WHERE id = ?").get(id) as { status: string } | undefined;
    if (!prev) return;
    d.prepare("UPDATE quotes SET status = ?, internal_notes = ?, updated_at = datetime('now') WHERE id = ?").run(status, internal_notes, id);
    if (prev.status !== status) {
      d.prepare("INSERT INTO quote_events (quote_id, type, detail) VALUES (?, 'status', ?)").run(
        id,
        `${QUOTE_STATUSES[prev.status as QuoteStatus] ?? prev.status} → ${QUOTE_STATUSES[status]}`,
      );
    }
  })();
}

export function logQuoteEvent(id: number, type: string, detail: string) {
  db().prepare("INSERT INTO quote_events (quote_id, type, detail) VALUES (?, ?, ?)").run(id, type, detail);
}

export function countQuotesByStatus() {
  return db().prepare("SELECT status, COUNT(*) n FROM quotes GROUP BY status").all() as { status: QuoteStatus; n: number }[];
}

/* ─────────────── Mensagens de contato ─────────────── */

export function createContactMessage(m: Omit<ContactMessage, "id" | "status" | "created_at"> & { consent_at: string }) {
  db()
    .prepare("INSERT INTO contact_messages (name, email, phone, subject, message, consent_at) VALUES (@name, @email, @phone, @subject, @message, @consent_at)")
    .run(m);
}
export function listContactMessages(): ContactMessage[] {
  return db().prepare("SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 500").all() as ContactMessage[];
}
export function setContactMessageStatus(id: number, status: ContactMessage["status"]) {
  db().prepare("UPDATE contact_messages SET status = ? WHERE id = ?").run(status, id);
}
export function countNewMessages() {
  return (db().prepare("SELECT COUNT(*) n FROM contact_messages WHERE status = 'novo'").get() as { n: number }).n;
}

/* ─────────────── Calculadora de custos ─────────────── */

export type CostCalc = {
  id: number;
  name: string;
  job: string;
  unit_cost_cents: number;
  unit_price_cents: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export function getCostDefaultsRaw(): unknown {
  const row = db().prepare("SELECT value FROM settings WHERE key = 'cost_defaults'").get() as { value: string } | undefined;
  return parseJson<unknown>(row?.value, null);
}
export function saveCostDefaults(value: unknown) {
  db()
    .prepare("INSERT INTO settings (key, value) VALUES ('cost_defaults', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(value));
}
export function listCostCalcs(): CostCalc[] {
  return db().prepare("SELECT * FROM cost_calcs ORDER BY updated_at DESC, id DESC LIMIT 200").all() as CostCalc[];
}
export function getCostCalc(id: number) {
  return db().prepare("SELECT * FROM cost_calcs WHERE id = ?").get(id) as CostCalc | undefined;
}
export function saveCostCalc(c: { id?: number; name: string; job: string; unit_cost_cents: number; unit_price_cents: number; quantity: number }) {
  if (c.id) {
    db()
      .prepare(
        "UPDATE cost_calcs SET name=@name, job=@job, unit_cost_cents=@unit_cost_cents, unit_price_cents=@unit_price_cents, quantity=@quantity, updated_at=datetime('now') WHERE id=@id",
      )
      .run(c);
    return c.id;
  }
  return Number(
    db()
      .prepare("INSERT INTO cost_calcs (name, job, unit_cost_cents, unit_price_cents, quantity) VALUES (@name, @job, @unit_cost_cents, @unit_price_cents, @quantity)")
      .run(c).lastInsertRowid,
  );
}
export function deleteCostCalc(id: number) {
  db().prepare("DELETE FROM cost_calcs WHERE id = ?").run(id);
}
