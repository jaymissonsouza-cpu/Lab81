"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import {
  QUOTE_STATUSES,
  deleteCategory,
  deletePost,
  deleteProduct,
  deleteProject,
  getPostById,
  getProductById,
  getProjectById,
  savePageSeo,
  savePost,
  saveProduct,
  saveProject,
  saveSettings,
  setContactMessageStatus,
  updateQuote,
  upsertCategory,
  type Availability,
  type ImageRef,
  type QuoteStatus,
} from "@/lib/repos";
import { saveMediaImage } from "@/lib/media";
import { slugify } from "@/lib/format";

export type FormState = { ok: boolean; message: string } | null;

const str = (f: FormData, k: string, max = 10000) => String(f.get(k) ?? "").trim().slice(0, max);
const bool = (f: FormData, k: string) => f.get(k) === "on";
const list = (f: FormData, k: string) =>
  str(f, k)
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);

function refreshSite() {
  revalidatePath("/", "layout");
}

/* ─────────────── Sessão ─────────────── */

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const ip = clientIp(await headers());
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60_000);
  if (!rl.ok) return { ok: false, message: `Muitas tentativas. Aguarde ${Math.ceil(rl.retryAfter / 60)} minutos.` };
  const email = str(form, "email", 200);
  const password = String(form.get("password") ?? "");
  if (!checkCredentials(email, password)) return { ok: false, message: "E-mail ou senha incorretos." };
  resetRateLimit(`login:${ip}`);
  await createSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ─────────────── Orçamentos e mensagens ─────────────── */

export async function updateQuoteAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = str(form, "status") as QuoteStatus;
  if (!id || !(status in QUOTE_STATUSES)) return { ok: false, message: "Dados inválidos." };
  updateQuote(id, status, str(form, "internal_notes", 20000));
  revalidatePath("/admin/orcamentos");
  return { ok: true, message: "Orçamento atualizado." };
}

export async function setMessageStatusAction(form: FormData) {
  await requireAdmin();
  const status = str(form, "status") as "novo" | "respondido" | "arquivado";
  if (!["novo", "respondido", "arquivado"].includes(status)) return;
  setContactMessageStatus(Number(form.get("id")), status);
  revalidatePath("/admin/mensagens");
}

/* ─────────────── Imagens (formulários de projeto/produto) ─────────────── */

async function collectImages(form: FormData): Promise<{ images: ImageRef[] } | { error: string }> {
  const srcs = form.getAll("img_src").map(String);
  const alts = form.getAll("img_alt").map(String);
  const remove = new Set(form.getAll("img_remove").map(String));
  const cover = str(form, "img_cover");
  let images: ImageRef[] = srcs
    .map((src, i) => ({ src, alt: (alts[i] ?? "").trim().slice(0, 300) }))
    .filter((img) => img.src && !remove.has(img.src) && /^\/(demo|media)\//.test(img.src));

  const newFiles = form.getAll("new_images").filter((f): f is File => f instanceof File && f.size > 0);
  const newAlt = str(form, "new_alt", 300);
  for (const file of newFiles.slice(0, 12)) {
    const saved = await saveMediaImage(file);
    if ("error" in saved) return { error: saved.error };
    images.push({ src: saved.src, alt: newAlt });
  }
  if (cover) images = [...images.filter((i) => i.src === cover), ...images.filter((i) => i.src !== cover)];
  if (images.some((i) => !i.alt)) return { error: "Toda imagem precisa de um texto alternativo (alt) descritivo." };
  return { images };
}

function uniqueSlugError(e: unknown) {
  return e instanceof Error && /UNIQUE/.test(e.message) ? "Já existe um item com este endereço (slug)." : null;
}

/* ─────────────── Projetos ─────────────── */

export async function saveProjectAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || undefined;
  const title = str(form, "title", 200);
  if (!title) return { ok: false, message: "Informe o título." };
  const img = await collectImages(form);
  if ("error" in img) return { ok: false, message: img.error };
  const prev = id ? getProjectById(id) : null;
  let newId: number;
  try {
    newId = saveProject({
      id,
      slug: slugify(str(form, "slug") || title),
      title,
      category: str(form, "category"),
      material: str(form, "material", 120),
      application: str(form, "application", 200),
      summary: str(form, "summary", 500),
      challenge: str(form, "challenge"),
      solution: str(form, "solution"),
      description: str(form, "description"),
      images: img.images,
      featured: bool(form, "featured"),
      published: bool(form, "published"),
      is_demo: bool(form, "is_demo"),
      seo_title: str(form, "seo_title", 200),
      seo_description: str(form, "seo_description", 320),
      sort: Number(form.get("sort")) || 0,
    });
  } catch (e) {
    return { ok: false, message: uniqueSlugError(e) ?? "Erro ao salvar." };
  }
  refreshSite();
  if (!prev) redirect(`/admin/projetos/${newId}?salvo=1`);
  return { ok: true, message: "Projeto salvo." };
}

export async function deleteProjectAction(form: FormData) {
  await requireAdmin();
  deleteProject(Number(form.get("id")));
  refreshSite();
  redirect("/admin/projetos");
}

/* ─────────────── Produtos ─────────────── */

export async function saveProductAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || undefined;
  const name = str(form, "name", 200);
  if (!name) return { ok: false, message: "Informe o nome." };
  const img = await collectImages(form);
  if ("error" in img) return { ok: false, message: img.error };
  const priceRaw = str(form, "price").replace(/\./g, "").replace(",", ".");
  const price = priceRaw ? Math.round(Number(priceRaw) * 100) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) return { ok: false, message: "Preço inválido." };
  const stockRaw = str(form, "stock");
  const availability = str(form, "availability") as Availability;
  const prev = id ? getProductById(id) : null;
  let newId: number;
  try {
    newId = saveProduct({
      id,
      slug: slugify(str(form, "slug") || name),
      name,
      category: str(form, "category"),
      summary: str(form, "summary", 500),
      description: str(form, "description"),
      materials: list(form, "materials"),
      colors: list(form, "colors"),
      sizes: list(form, "sizes"),
      customizable: bool(form, "customizable"),
      availability: ["sob_consulta", "sob_encomenda", "pronta_entrega", "indisponivel"].includes(availability) ? availability : "sob_consulta",
      price_cents: price,
      show_price: bool(form, "show_price") && price !== null,
      stock: stockRaw ? Math.max(0, Number(stockRaw) | 0) : null,
      images: img.images,
      published: bool(form, "published"),
      is_demo: bool(form, "is_demo"),
      seo_title: str(form, "seo_title", 200),
      seo_description: str(form, "seo_description", 320),
      sort: Number(form.get("sort")) || 0,
    });
  } catch (e) {
    return { ok: false, message: uniqueSlugError(e) ?? "Erro ao salvar." };
  }
  refreshSite();
  if (!prev) redirect(`/admin/produtos/${newId}?salvo=1`);
  return { ok: true, message: "Produto salvo." };
}

export async function deleteProductAction(form: FormData) {
  await requireAdmin();
  deleteProduct(Number(form.get("id")));
  refreshSite();
  redirect("/admin/produtos");
}

/* ─────────────── Blog ─────────────── */

export async function savePostAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || undefined;
  const title = str(form, "title", 200);
  if (!title) return { ok: false, message: "Informe o título." };
  let cover = str(form, "cover", 300);
  const coverFile = form.get("cover_file");
  if (coverFile instanceof File && coverFile.size > 0) {
    const saved = await saveMediaImage(coverFile);
    if ("error" in saved) return { ok: false, message: saved.error };
    cover = saved.src;
  }
  if (cover && !/^\/(demo|media|brand)\//.test(cover)) return { ok: false, message: "Imagem de capa inválida." };
  const published_at = str(form, "published_at", 10) || null;
  if (published_at && !/^\d{4}-\d{2}-\d{2}$/.test(published_at)) return { ok: false, message: "Data inválida." };
  const prev = id ? getPostById(id) : null;
  let newId: number;
  try {
    newId = savePost({
      id,
      slug: slugify(str(form, "slug") || title),
      title,
      excerpt: str(form, "excerpt", 400),
      content: str(form, "content", 200000),
      cover,
      cover_alt: str(form, "cover_alt", 300),
      published: bool(form, "published"),
      published_at: published_at ?? (bool(form, "published") ? new Date().toISOString().slice(0, 10) : null),
      seo_title: str(form, "seo_title", 200),
      seo_description: str(form, "seo_description", 320),
    });
  } catch (e) {
    return { ok: false, message: uniqueSlugError(e) ?? "Erro ao salvar." };
  }
  refreshSite();
  if (!prev) redirect(`/admin/blog/${newId}?salvo=1`);
  return { ok: true, message: "Artigo salvo." };
}

export async function deletePostAction(form: FormData) {
  await requireAdmin();
  deletePost(Number(form.get("id")));
  refreshSite();
  redirect("/admin/blog");
}

/* ─────────────── Categorias, SEO e configurações ─────────────── */

export async function saveCategoryAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const type = str(form, "type") as "project" | "product";
  const name = str(form, "name", 80);
  if (!["project", "product"].includes(type) || !name) return { ok: false, message: "Informe o nome." };
  try {
    upsertCategory({ id: Number(form.get("id")) || undefined, type, name, slug: slugify(str(form, "slug") || name), sort: Number(form.get("sort")) || 0 });
  } catch (e) {
    return { ok: false, message: uniqueSlugError(e) ?? "Erro ao salvar." };
  }
  refreshSite();
  return { ok: true, message: "Categoria salva." };
}

export async function deleteCategoryAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const r = deleteCategory(Number(form.get("id")));
  if (!r.ok) return { ok: false, message: r.reason ?? "Erro." };
  refreshSite();
  return { ok: true, message: "Categoria removida." };
}

export async function savePageSeoAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const paths = form.getAll("path").map(String);
  const titles = form.getAll("title").map(String);
  const descs = form.getAll("description").map(String);
  paths.forEach((p, i) => savePageSeo(p, (titles[i] ?? "").trim().slice(0, 200), (descs[i] ?? "").trim().slice(0, 320)));
  refreshSite();
  return { ok: true, message: "Metadados salvos." };
}

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const keys = ["whatsapp", "phone", "email", "instagram", "address", "city", "region", "service_area", "business_hours", "legal_name", "cnpj"];
  const values: Record<string, string> = {};
  for (const k of keys) values[k] = str(form, k, 500);
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { ok: false, message: "E-mail inválido." };
  values.materials = JSON.stringify(list(form, "materials"));
  values.colors = JSON.stringify(list(form, "colors"));
  const mb = Number(form.get("max_model_mb"));
  values.max_model_mb = String(Number.isFinite(mb) ? Math.min(100, Math.max(5, mb)) : 50);
  saveSettings(values);
  refreshSite();
  return { ok: true, message: "Configurações salvas." };
}
