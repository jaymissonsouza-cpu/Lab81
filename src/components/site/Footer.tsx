import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/repos";
import { instagramUrl, telUrl, whatsappUrl } from "@/lib/contact";
import { Icon } from "@/components/ui/Icon";

const SERVICES = [
  { href: "/impressao-3d-recife", label: "Impressão 3D em Recife" },
  { href: "/impressao-3d-personalizada", label: "Impressão 3D personalizada" },
  { href: "/brindes-personalizados", label: "Brindes e chaveiros" },
  { href: "/solucoes-para-empresas", label: "Soluções para empresas" },
  { href: "/modelagem-3d", label: "Modelagem 3D" },
  { href: "/prototipagem-3d", label: "Prototipagem 3D" },
  { href: "/produtos", label: "Produtos sob encomenda" },
];
const STUDIO = [
  { href: "/projetos", label: "Projetos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
  { href: "/orcamento", label: "Solicitar orçamento" },
];

export function Footer() {
  const s = getSettings();
  const wa = whatsappUrl(s.whatsapp, "Olá! Vim pelo site da LAB81 e gostaria de falar sobre um projeto.");
  const ig = instagramUrl(s.instagram);
  const tel = telUrl(s.phone);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-line bg-carbon-900">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange/60 to-transparent" />
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Image src="/brand/lab81-logo-completo.png" alt="LAB81 Studio" width={878} height={760} className="h-24 w-auto" sizes="120px" />
          <p className="mt-6 max-w-sm text-titanium">
            Estúdio de design e fabricação digital em Recife. Criamos, desenvolvemos e fabricamos peças únicas com impressão 3D.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-titanium-600">Da ideia ao objeto.</p>
        </div>

        <nav aria-label="Serviços" className="md:col-span-3">
          <h2 className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-titanium-600">Serviços</h2>
          <ul className="mt-5 space-y-3">
            {SERVICES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-titanium transition-colors hover:text-offwhite">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Estúdio" className="md:col-span-2">
          <h2 className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-titanium-600">Estúdio</h2>
          <ul className="mt-5 space-y-3">
            {STUDIO.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-titanium transition-colors hover:text-offwhite">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-titanium-600">Contato</h2>
          <ul className="mt-5 space-y-3 text-titanium">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-offwhite" data-track="whatsapp_click" data-track-location="footer">
                  <Icon name="whatsapp" size={18} /> WhatsApp
                </a>
              </li>
            )}
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-2 break-all hover:text-offwhite" data-track="contact_click" data-track-channel="email">
                  <Icon name="mail" size={18} /> {s.email}
                </a>
              </li>
            )}
            {tel && (
              <li>
                <a href={tel} className="inline-flex items-center gap-2 hover:text-offwhite" data-track="contact_click" data-track-channel="phone">
                  <Icon name="phone" size={18} /> {s.phone}
                </a>
              </li>
            )}
            {ig && (
              <li>
                <a href={ig} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-offwhite" data-track="contact_click" data-track-channel="instagram">
                  <Icon name="instagram" size={18} /> Instagram
                </a>
              </li>
            )}
            <li className="inline-flex items-center gap-2">
              <Icon name="pin" size={18} /> {s.city}, {s.region}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-3 py-6 text-sm text-titanium-600 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} LAB81 Studio{s.legal_name ? ` · ${s.legal_name}` : ""}
            {s.cnpj ? ` · CNPJ ${s.cnpj}` : ""}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/politica-de-privacidade" className="hover:text-offwhite">
              Política de privacidade
            </Link>
            <button type="button" data-open-consent className="hover:text-offwhite">
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
