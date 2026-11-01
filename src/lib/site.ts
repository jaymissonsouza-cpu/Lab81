export const SITE_NAME = "LAB81 Studio";
export const SITE_TAGLINE = "Da ideia ao objeto.";
export const SITE_DESCRIPTION =
  "Estúdio de design e fabricação digital em Recife. Impressão 3D personalizada, brindes e chaveiros, soluções para empresas e restaurantes, modelagem 3D, prototipagem e peças sob medida.";

export function siteUrl(path = "/") {
  // SITE_URL é lida em tempo de execução (configurável no servidor sem novo build);
  // NEXT_PUBLIC_SITE_URL é fixada no build.
  const base = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
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
