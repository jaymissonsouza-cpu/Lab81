export const SITE_NAME = "LAB81 Studio";
export const SITE_TAGLINE = "Da ideia ao objeto.";
export const SITE_DESCRIPTION =
  "Estúdio de design e fabricação digital em Recife. Impressão 3D personalizada, modelagem 3D, prototipagem e produtos autorais com acabamento profissional.";

export function siteUrl(path = "/") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/projetos", label: "Projetos" },
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;
