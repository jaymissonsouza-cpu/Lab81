import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { getSettings } from "@/lib/repos";
import { instagramUrl, telUrl, whatsappUrl } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "./ContactForm";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata({
    path: "/contato",
    title: "Contato",
    description: "Fale com a LAB81 Studio, estúdio de impressão 3D em Recife. Envie sua mensagem ou solicite um orçamento para o seu projeto.",
  });
}

export default function ContatoPage() {
  const s = getSettings();
  const channels = [
    s.whatsapp && { icon: "whatsapp" as const, label: "WhatsApp", value: s.whatsapp, href: whatsappUrl(s.whatsapp, "Olá! Vim pelo site da LAB81."), track: "whatsapp_click" },
    s.email && { icon: "mail" as const, label: "E-mail", value: s.email, href: `mailto:${s.email}`, track: "contact_click" },
    s.phone && { icon: "phone" as const, label: "Telefone", value: s.phone, href: telUrl(s.phone), track: "contact_click" },
    s.instagram && { icon: "instagram" as const, label: "Instagram", value: s.instagram, href: instagramUrl(s.instagram), track: "contact_click" },
  ].filter(Boolean) as { icon: "whatsapp" | "mail" | "phone" | "instagram"; label: string; value: string; href: string | null; track: string }[];

  return (
    <>
      <PageHeader
        eyebrow="Contato"
        title="Vamos conversar."
        lead="Para pedir um orçamento, o caminho mais rápido é o formulário de orçamento, onde você já anexa arquivos e referências. Para outros assuntos, use os canais abaixo."
        crumbs={[{ name: "Contato", path: "/contato" }]}
      >
        <Link href="/orcamento" className="btn btn-primary" data-track="quote_cta_click" data-track-location="contato_header">
          Solicitar orçamento <Icon name="arrow" size={18} />
        </Link>
      </PageHeader>

      <div className="container-site grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-labelledby="canais">
          <h2 id="canais" className="text-h3">Canais de atendimento</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href ?? "#"}
                  target={c.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  className="group flex items-center gap-4 py-5"
                  data-track={c.track}
                  data-track-location="contato"
                  data-track-channel={c.label.toLowerCase()}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong group-hover:border-orange group-hover:text-orange">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.2em] text-titanium-600">{c.label}</span>
                    <span className="block break-all text-offwhite group-hover:text-orange">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
            <li className="flex items-center gap-4 py-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong">
                <Icon name="pin" size={20} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-titanium-600">Localização</span>
                <span className="block text-offwhite">{s.address ? `${s.address}, ${s.city} – ${s.region}` : `${s.city} – ${s.region}`}</span>
                {s.service_area && <span className="mt-1 block text-sm text-titanium">{s.service_area}</span>}
              </span>
            </li>
            {s.business_hours && (
              <li className="flex items-center gap-4 py-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong">
                  <Icon name="clock" size={20} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-titanium-600">Horário</span>
                  <span className="block text-offwhite">{s.business_hours}</span>
                </span>
              </li>
            )}
          </ul>
        </section>
        <section className="lg:col-span-7" aria-labelledby="mensagem">
          <h2 id="mensagem" className="text-h3">Envie uma mensagem</h2>
          <div className="relative mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
}
