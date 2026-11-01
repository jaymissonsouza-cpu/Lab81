import Image from "next/image";
import Link from "next/link";
import type { ServicePage } from "@/content/services";
import { MATERIALS_INFO } from "@/content/services";
import { PageHeader } from "./PageHeader";
import { CtaBand } from "./CtaBand";
import { JsonLd } from "./JsonLd";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Icon } from "@/components/ui/Icon";
import { serviceJsonLd } from "@/lib/seo";

export function ServicePageView({ page, name }: { page: ServicePage; name: string }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name, description: page.metaDescription, path: page.path })} />
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.h1}
        lead={page.lead}
        crumbs={[
          { name: "Serviços", path: "/servicos" },
          { name, path: page.path },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/orcamento" className="btn btn-primary" data-track="quote_cta_click" data-track-location={`service_${page.path.slice(1)}`}>
            Solicitar orçamento <Icon name="arrow" size={18} />
          </Link>
          <Link href="/projetos" className="btn btn-outline">
            Ver projetos <Icon name="arrow" size={18} />
          </Link>
        </div>
      </PageHeader>

      <section className="container-site" aria-label="Destaques">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="reveal relative aspect-[16/10] overflow-hidden rounded-lg border border-line lg:col-span-7">
            <Image src={page.image.src} alt={page.image.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" priority />
            <DemoBadge className="absolute left-3 top-3" />
          </div>
          <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:col-span-5">
            {page.highlights.map((h, i) => (
              <li key={h.title} className="reveal flex gap-5 bg-carbon p-6 md:p-7">
                <span className="font-display text-sm text-titanium-600">0{i + 1}</span>
                <div>
                  <h2 className="font-display text-lg font-semibold">{h.title}</h2>
                  <p className="mt-1.5 text-titanium">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-site mt-20 grid gap-14 md:mt-28 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {page.sections.map((s) => (
            <section key={s.title} id={s.id} className="reveal border-t border-line py-10 first:border-t-0 first:pt-0">
              <h2 className="text-h3 md:text-[2rem]">{s.title}</h2>
              <div className="prose-lab mt-5">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 30)}>{p}</p>
                ))}
                {s.bullets && (
                  <ul>
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <section className="reveal border-t border-line pt-10" aria-labelledby="materiais">
            <h2 id="materiais" className="text-h3 md:text-[2rem]">
              Materiais que utilizamos
            </h2>
            <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {MATERIALS_INFO.map((m) => (
                <li key={m.name} className="bg-carbon p-6">
                  <p className="font-display text-xl font-semibold">{m.name}</p>
                  <p className="mt-2 text-titanium">{m.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="faq">
            <h2 id="faq" className="text-h3 md:text-[2rem]">
              Perguntas frequentes
            </h2>
            <div className="mt-6 border-t border-line">
              {page.faqs.map((f) => (
                <details key={f.q} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    <h3 className="text-lg">{f.q}</h3>
                    <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                      <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-orange" />
                      <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-orange transition-transform duration-300 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="pb-6 pr-10 text-titanium">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4" aria-label="Leia também">
          <div className="panel p-6 lg:sticky lg:top-28">
            <p className="eyebrow eyebrow--lead">Leia também</p>
            <ul className="mt-5 divide-y divide-line">
              {page.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group flex items-center justify-between gap-4 py-4 text-offwhite hover:text-orange">
                    {r.label}
                    <Icon name="arrow" size={16} className="shrink-0 text-titanium transition-transform group-hover:translate-x-1 group-hover:text-orange" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/orcamento" className="btn btn-primary mt-6 w-full" data-track="quote_cta_click" data-track-location="service_sidebar">
              Solicitar orçamento <Icon name="arrow" size={18} />
            </Link>
          </div>
        </aside>
      </div>

      <CtaBand title={page.ctaTitle} location={`service_${page.path.slice(1)}_final`} />
    </>
  );
}
