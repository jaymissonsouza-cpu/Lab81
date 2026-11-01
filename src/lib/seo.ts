import "server-only";
import type { Metadata } from "next";
import { SITE_NAME, siteUrl } from "./site";
import { getPageSeo, getSettings } from "./repos";

type MetaInput = {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

/** Metadados por página. Título/descrição podem ser sobrescritos em /admin/seo. */
export function pageMetadata(input: MetaInput): Metadata {
  const override = safePageSeo(input.path);
  const title = override?.title || input.title;
  const description = override?.description || input.description;
  const image = input.image || "/brand/og-lab81.jpg";
  return {
    title: { absolute: title.includes("LAB81") ? title : `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: input.path },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      url: input.path,
      siteName: SITE_NAME,
      locale: "pt_BR",
      title,
      description,
      images: [{ url: image }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function safePageSeo(path: string) {
  try {
    return getPageSeo(path);
  } catch {
    return null;
  }
}

/* ─────────────── Dados estruturados (schema.org) ─────────────── */

export function organizationJsonLd() {
  const s = getSettings();
  const sameAs = [s.instagram].filter(Boolean);
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl("/#organization"),
    name: SITE_NAME,
    url: siteUrl("/"),
    logo: siteUrl("/brand/icon-512.png"),
    slogan: "Da ideia ao objeto.",
    areaServed: [
      { "@type": "City", name: "Recife" },
      { "@type": "State", name: "Pernambuco" },
    ],
  };
  if (s.legal_name) org.legalName = s.legal_name;
  if (s.email) org.email = s.email;
  if (s.phone) org.telephone = s.phone;
  if (sameAs.length) org.sameAs = sameAs;

  const graph: Record<string, unknown>[] = [
    org,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": siteUrl("/#website"),
      url: siteUrl("/"),
      name: SITE_NAME,
      inLanguage: "pt-BR",
      publisher: { "@id": siteUrl("/#organization") },
    },
  ];

  // LocalBusiness apenas com endereço verificado cadastrado no painel (nunca dados fictícios).
  if (s.address) {
    const lb: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": siteUrl("/#localbusiness"),
      name: SITE_NAME,
      url: siteUrl("/"),
      image: siteUrl("/brand/og-lab81.jpg"),
      address: {
        "@type": "PostalAddress",
        streetAddress: s.address,
        addressLocality: s.city,
        addressRegion: s.region,
        addressCountry: "BR",
      },
      parentOrganization: { "@id": siteUrl("/#organization") },
    };
    if (s.phone) lb.telephone = s.phone;
    graph.push(lb);
  }
  return graph;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: siteUrl(it.path),
    })),
  };
}

export function serviceJsonLd(s: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    url: siteUrl(s.path),
    serviceType: s.name,
    provider: { "@id": siteUrl("/#organization") },
    areaServed: [
      { "@type": "City", name: "Recife" },
      { "@type": "State", name: "Pernambuco" },
    ],
  };
}
