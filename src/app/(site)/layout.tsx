import { SiteChrome } from "@/components/site/SiteChrome";

// Rede de segurança: páginas públicas se atualizam com o banco no máximo a cada 5 minutos.
export const revalidate = 300;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
