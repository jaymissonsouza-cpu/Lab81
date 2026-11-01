import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { Icon } from "@/components/ui/Icon";
import { SERVICE_CARDS, MATERIALS_INFO } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/servicos",
    title: "Serviços de impressão 3D, modelagem e prototipagem",
    description:
      "Conheça os serviços da LAB81 Studio em Recife: impressão 3D personalizada, modelagem 3D, prototipagem, peças funcionais e produtos autorais.",
  });
}

export default function ServicosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Serviços"
        title="Da primeira ideia à peça final."
        lead="Projetamos e fabricamos no mesmo estúdio. Escolha por onde começar ou simplesmente conte sua ideia: nós indicamos o caminho."
        crumbs={[{ name: "Serviços", path: "/servicos" }]}
      />
      <section className="container-site" aria-label="Lista de serviços">
        <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {SERVICE_CARDS.map((s, i) => (
            <li key={s.href} className={`reveal group relative bg-carbon p-8 transition-colors hover:bg-carbon-800 md:p-10 ${i === 0 ? "md:col-span-2" : ""}`}>
              <div className="flex items-start justify-between gap-6">
                <Icon name={s.icon} size={32} className="text-orange" strokeWidth={1.25} />
                <span className="font-display text-sm text-titanium-600">0{i + 1}</span>
              </div>
              <h2 className="mt-8 text-h3">
                <Link href={s.href} className="after:absolute after:inset-0 group-hover:text-orange">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-xl text-titanium">{s.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-offwhite">
                Saiba mais <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-titanium">
          Está em Recife?{" "}
          <Link href="/impressao-3d-recife" className="text-offwhite underline decoration-orange underline-offset-4 hover:text-orange">
            Veja como funciona nosso atendimento local
          </Link>
          .
        </p>
      </section>

      <section className="container-site mt-24" aria-labelledby="materiais">
        <h2 id="materiais" className="text-h2">
          Materiais<span className="dot">.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-lead text-titanium">Impressão 3D por filamento (FDM). Não sabe qual escolher? Indicamos no orçamento.</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS_INFO.map((m) => (
            <li key={m.name} className="reveal panel p-6">
              <p className="font-display text-3xl font-bold">{m.name}</p>
              <span aria-hidden="true" className="mt-4 block h-0.5 w-8 bg-orange" />
              <p className="mt-4 text-titanium">{m.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand location="servicos_final" />
    </>
  );
}
