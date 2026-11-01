import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { Icon } from "@/components/ui/Icon";
import { listPosts } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";
import { formatDate, readingTime } from "@/lib/format";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata({
    path: "/blog",
    title: "Blog de impressão 3D: guias, materiais e dicas",
    description:
      "Guias práticos sobre impressão 3D: preços, materiais como PLA e PETG, arquivos STL e STEP, prototipagem e como encomendar peças sob demanda.",
  });
}

export default function BlogPage() {
  const posts = listPosts({ publishedOnly: true });
  const [first, ...rest] = posts;
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Guia de impressão 3D."
        lead="Respostas diretas para quem quer transformar uma ideia em objeto: materiais, arquivos, custos e processos."
        crumbs={[{ name: "Blog", path: "/blog" }]}
      />
      <section className="container-site" aria-label="Artigos">
        {first && (
          <article className="reveal group relative overflow-hidden rounded-lg border border-line bg-carbon-800 p-8 transition-colors hover:border-line-strong md:p-12">
            <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-60" />
            <div className="relative max-w-3xl">
              <p className="text-xs uppercase tracking-[0.2em] text-titanium-600">
                {formatDate(first.published_at)} · {readingTime(first.content)} min de leitura
              </p>
              <h2 className="mt-5 text-h2">
                <Link href={`/blog/${first.slug}`} className="after:absolute after:inset-0">
                  {first.title}
                </Link>
              </h2>
              <p className="mt-5 text-lead text-titanium">{first.excerpt}</p>
              <span className="mt-8 inline-flex items-center gap-2 font-medium text-orange">
                Ler artigo <Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </article>
        )}
        <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.slug} className="reveal group relative flex flex-col bg-carbon p-7 transition-colors hover:bg-carbon-800">
              <p className="text-xs uppercase tracking-[0.2em] text-titanium-600">{readingTime(p.content)} min de leitura</p>
              <h2 className="mt-4 font-display text-xl font-semibold leading-snug">
                <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-orange">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-3 line-clamp-3 text-titanium">{p.excerpt}</p>
            </li>
          ))}
        </ul>
        {posts.length === 0 && <p className="text-titanium">Novos artigos em breve.</p>}
      </section>
      <CtaBand location="blog_final" />
    </>
  );
}
