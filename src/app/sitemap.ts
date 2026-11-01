import type { MetadataRoute } from "next";
import { listPosts, listProducts, listProjects } from "@/lib/repos";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/impressao-3d-recife", priority: 0.9, changeFrequency: "monthly" },
  { path: "/impressao-3d-personalizada", priority: 0.9, changeFrequency: "monthly" },
  { path: "/modelagem-3d", priority: 0.8, changeFrequency: "monthly" },
  { path: "/prototipagem-3d", priority: 0.8, changeFrequency: "monthly" },
  { path: "/servicos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/orcamento", priority: 0.9, changeFrequency: "yearly" },
  { path: "/projetos", priority: 0.8, changeFrequency: "weekly" },
  { path: "/produtos", priority: 0.7, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/sobre", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contato", priority: 0.5, changeFrequency: "yearly" },
  { path: "/politica-de-privacidade", priority: 0.2, changeFrequency: "yearly" },
];

const iso = (d: string) => new Date(d.length === 10 ? `${d}T12:00:00Z` : `${d.replace(" ", "T")}Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map((r) => ({ url: siteUrl(r.path), changeFrequency: r.changeFrequency, priority: r.priority })),
    ...listProjects({ publishedOnly: true }).map((p) => ({
      url: siteUrl(`/projetos/${p.slug}`),
      lastModified: iso(p.updated_at),
      priority: 0.6,
      images: p.images.map((i) => siteUrl(i.src)),
    })),
    ...listProducts({ publishedOnly: true }).map((p) => ({
      url: siteUrl(`/produtos/${p.slug}`),
      lastModified: iso(p.updated_at),
      priority: 0.6,
      images: p.images.map((i) => siteUrl(i.src)),
    })),
    ...listPosts({ publishedOnly: true }).map((p) => ({ url: siteUrl(`/blog/${p.slug}`), lastModified: iso(p.updated_at), priority: 0.6 })),
  ];
}
