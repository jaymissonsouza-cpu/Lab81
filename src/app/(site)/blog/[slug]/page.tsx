import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { getPost, listPosts } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/format";
import { SITE_NAME, siteUrl } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return listPosts({ publishedOnly: true }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug, { publishedOnly: true });
  if (!p) return {};
  return pageMetadata({
    path: `/blog/${p.slug}`,
    title: p.seo_title || p.title,
    description: p.seo_description || p.excerpt,
    image: p.cover || undefined,
    type: "article",
    publishedTime: p.published_at ?? undefined,
    modifiedTime: p.updated_at,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug, { publishedOnly: true });
  if (!p) notFound();
  const html = renderMarkdown(p.content);
  const toc = extractHeadings(p.content);
  const others = listPosts({ publishedOnly: true })
    .filter((x) => x.slug !== p.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.published_at,
          dateModified: p.updated_at.replace(" ", "T") + "Z",
          inLanguage: "pt-BR",
          mainEntityOfPage: siteUrl(`/blog/${p.slug}`),
          image: siteUrl(p.cover || "/brand/og-lab81.jpg"),
          author: { "@type": "Organization", name: SITE_NAME, url: siteUrl("/") },
          publisher: { "@id": siteUrl("/#organization") },
        }}
      />
      <article>
        <header className="relative overflow-hidden pb-12 pt-28 md:pt-36">
          <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-site relative">
            <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }]} />
            <p className="eyebrow fade-up mt-10">
              {formatDate(p.published_at)} · {readingTime(p.content)} min
            </p>
            <h1 className="fade-up fade-up-1 mt-5 max-w-4xl text-h1">{p.title}</h1>
            <p className="fade-up fade-up-2 mt-6 max-w-2xl text-lead text-titanium">{p.excerpt}</p>
          </div>
        </header>

        <div className="container-site grid gap-12 lg:grid-cols-12">
          {toc.length > 2 && (
            <nav aria-label="Neste artigo" className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-28">
                <p className="text-xs uppercase tracking-[0.25em] text-titanium-600">Neste artigo</p>
                <ol className="mt-4 space-y-2.5 border-l border-line">
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 text-sm text-titanium hover:border-orange hover:text-offwhite">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          )}
          <div className={`prose-lab max-w-[44rem] ${toc.length > 2 ? "lg:col-span-8 lg:col-start-5" : "lg:col-span-8 lg:col-start-3"}`} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>

      {others.length > 0 && (
        <section className="container-site mt-24" aria-labelledby="leia-tambem">
          <h2 id="leia-tambem" className="text-h3 md:text-[2rem]">
            Leia também<span className="dot">.</span>
          </h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug} className="group relative bg-carbon p-7 transition-colors hover:bg-carbon-800">
                <h3 className="font-display text-lg font-semibold leading-snug">
                  <Link href={`/blog/${o.slug}`} className="after:absolute after:inset-0 group-hover:text-orange">
                    {o.title}
                  </Link>
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-titanium">
                  Ler <Icon name="arrow" size={14} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaBand title="Tem um projeto em mente?" location="blog_post_final" />
    </>
  );
}
