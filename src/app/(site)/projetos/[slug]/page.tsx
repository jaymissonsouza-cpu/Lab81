import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProjectTile, toPortfolioItem } from "@/components/site/ProjectTile";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { TrackView } from "@/components/site/TrackView";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Icon } from "@/components/ui/Icon";
import { getProject, listCategories, listProjects } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return listProjects({ publishedOnly: true }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug, { publishedOnly: true });
  if (!p) return {};
  return pageMetadata({
    path: `/projetos/${p.slug}`,
    title: p.seo_title || `${p.title} — projeto em impressão 3D`,
    description: p.seo_description || p.summary,
    image: p.images[0]?.src,
  });
}

export default async function ProjetoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug, { publishedOnly: true });
  if (!p) notFound();
  const categories = listCategories("project");
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const related = listProjects({ publishedOnly: true })
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category))
    .slice(0, 3);
  const [cover, ...gallery] = p.images;

  const facts = [
    { label: "Categoria", value: catName[p.category] ?? p.category },
    { label: "Material", value: p.material },
    { label: "Aplicação", value: p.application },
  ].filter((f) => f.value);

  return (
    <>
      <TrackView event="project_view" params={{ project: p.slug }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          description: p.summary,
          url: siteUrl(`/projetos/${p.slug}`),
          image: p.images.map((i) => siteUrl(i.src)),
          creator: { "@id": siteUrl("/#organization") },
          material: p.material || undefined,
        }}
      />
      <article>
        <header className="pb-10 pt-28 md:pt-36">
          <div className="container-site">
            <Breadcrumbs items={[{ name: "Projetos", path: "/projetos" }, { name: p.title, path: `/projetos/${p.slug}` }]} />
            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow fade-up">{catName[p.category] ?? p.category}</p>
                <h1 className="fade-up fade-up-1 mt-5 text-h1">
                  {p.title}
                  <span className="dot">.</span>
                </h1>
                <p className="fade-up fade-up-2 mt-6 max-w-2xl text-lead text-titanium">{p.summary}</p>
              </div>
              <dl className="fade-up fade-up-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line lg:col-span-4 lg:grid-cols-1">
                {facts.map((f) => (
                  <div key={f.label} className="bg-carbon p-4 lg:flex lg:items-center lg:justify-between lg:px-5">
                    <dt className="text-xs uppercase tracking-[0.18em] text-titanium-600">{f.label}</dt>
                    <dd className="mt-1 font-medium lg:mt-0">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </header>

        {cover && (
          <div className="container-site">
            <figure className="build-up relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-carbon-900">
              <Image src={cover.src} alt={cover.alt} fill priority sizes="(min-width: 1344px) 1344px, 100vw" className="object-cover" quality={90} />
              {p.is_demo && <DemoBadge className="absolute left-4 top-4" />}
            </figure>
          </div>
        )}

        {p.is_demo && (
          <div className="container-site mt-6">
            <p className="max-w-3xl border-l-2 border-titanium/40 pl-4 text-sm text-titanium-600">
              Projeto demonstrativo: imagem e textos ilustram o tipo de trabalho realizado pelo estúdio e serão substituídos por um
              projeto executado pela LAB81.
            </p>
          </div>
        )}

        <div className="container-site mt-16 grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            {p.challenge && (
              <section className="reveal">
                <h2 className="eyebrow eyebrow--lead">O desafio</h2>
                <p className="mt-4 text-xl leading-relaxed text-offwhite md:text-2xl">{p.challenge}</p>
              </section>
            )}
            {p.solution && (
              <section className="reveal">
                <h2 className="eyebrow eyebrow--lead">A solução</h2>
                <p className="mt-4 text-lg leading-relaxed text-titanium">{p.solution}</p>
              </section>
            )}
            {p.description && (
              <section className="reveal">
                <h2 className="eyebrow eyebrow--lead">Sobre o projeto</h2>
                <p className="mt-4 text-lg leading-relaxed text-titanium">{p.description}</p>
              </section>
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="panel p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-semibold">Quer algo parecido?</h2>
              <p className="mt-2 text-titanium">Envie sua ideia e receba uma proposta personalizada para um projeto semelhante.</p>
              <Link
                href={`/orcamento?referencia=${encodeURIComponent(p.slug)}`}
                className="btn btn-primary mt-6 w-full"
                data-track="quote_cta_click"
                data-track-location="project_detail"
              >
                Solicitar projeto semelhante <Icon name="arrow" size={18} />
              </Link>
            </div>
          </aside>
        </div>

        {gallery.length > 0 && (
          <section className="container-site mt-16" aria-label="Galeria">
            <ul className="grid gap-4 sm:grid-cols-2">
              {gallery.map((img) => (
                <li key={img.src} className="reveal relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-carbon-900">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section className="container-site mt-24" aria-labelledby="relacionados">
          <h2 id="relacionados" className="text-h2">
            Projetos relacionados<span className="dot">.</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <ProjectTile item={toPortfolioItem(r)} categoryName={catName[r.category] ?? r.category} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand location="project_final" />
    </>
  );
}
