import { Header } from "./Header";
import { Footer } from "./Footer";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";
import { Analytics } from "./Analytics";
import { JsonLd } from "./JsonLd";
import { organizationJsonLd } from "@/lib/seo";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Header logo={<Logo />} />
      <main id="conteudo" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <Analytics gtmId={process.env.NEXT_PUBLIC_GTM_ID || undefined} />
    </>
  );
}
