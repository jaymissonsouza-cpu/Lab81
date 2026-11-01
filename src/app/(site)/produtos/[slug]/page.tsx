import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard } from "@/components/site/ProductCard";
import { CtaBand } from "@/components/site/CtaBand";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Icon } from "@/components/ui/Icon";
import { AVAILABILITY_LABEL, getProduct, listCategories, listProducts } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return listProducts({ publishedOnly: true }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug, { publishedOnly: true });
  if (!p) return {};
  return pageMetadata({
    path: `/produtos/${p.slug}`,
    title: p.seo_title || `${p.name} — produto autoral impresso em 3D`,
    description: p.seo_description || p.summary,
    image: p.images[0]?.src,
  });
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug, { publishedOnly: true });
  if (!p) notFound();
  const catName = Object.fromEntries(listCategories("product").map((c) => [c.slug, c.name]));
  const related = listProducts({ publishedOnly: true })
    .filter((x) => x.slug !== p.slug)
    .slice(0, 4);
  const [cover, ...rest] = p.images;

  const specs = [
    { label: "Disponibilidade", value: AVAILABILITY_LABEL[p.availability] },
    { label: "Materiais", value: p.materials.join(", ") },
    { label: "Cores", value: p.colors.length ? p.colors.join(", ") : "Consulte as opções no orçamento" },
    { label: "Tamanhos", value: p.sizes.length ? p.sizes.join(", ") : p.customizable ? "Sob medida" : "" },
    { label: "Personalização", value: p.customizable ? "Disponível" : "" },
  ].filter((s) => s.value);

  return (
    <>
      <div className="container-site pt-28 md:pt-36">
        <Breadcrumbs items={[{ name: "Produtos", path: "/produtos" }, { name: p.name, path: `/produtos/${p.slug}` }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            {cover && (
              <div className="build-up relative aspect-square overflow-hidden rounded-lg border border-line bg-carbon-900">
                <Image src={cover.src} alt={cover.alt} fill priority quality={90} sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
                {p.is_demo && <DemoBadge className="absolute left-4 top-4" />}
              </div>
            )}
            {rest.length > 0 && (
              <ul className="grid grid-cols-2 gap-4">
                {rest.map((img) => (
                  <li key={img.src} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-carbon-900">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 29vw, 50vw" className="object-cover" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">{catName[p.category] ?? p.category}</p>
              <h1 className="mt-5 text-h2">
                {p.name}
                <span className="dot">.</span>
              </h1>
              <p className="mt-5 text-lead text-titanium">{p.summary}</p>
              {p.show_price && p.price_cents != null && (
                <p className="mt-6 font-display text-3xl font-bold">
                  {formatPrice(p.price_cents)}
                  <span className="ml-2 align-middle text-sm font-normal text-titanium-600">valor de referência</span>
                </p>
              )}
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-6 py-3.5 text-sm">
                    <dt className="text-titanium-600">{s.label}</dt>
                    <dd className="text-right text-offwhite">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={`/orcamento?produto=${encodeURIComponent(p.slug)}`}
                className="btn btn-primary mt-8 w-full"
                data-track="quote_cta_click"
                data-track-location="product_detail"
              >
                Solicitar este produto <Icon name="arrow" size={18} />
              </Link>
              <p className="mt-3 text-center text-sm text-titanium-600">Pedido por orçamento. Você recebe valor e prazo antes de confirmar.</p>
              {p.description && (
                <div className="mt-10">
                  <h2 className="eyebrow eyebrow--lead">Sobre a peça</h2>
                  <p className="mt-4 leading-relaxed text-titanium">{p.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-site mt-24" aria-labelledby="mais-produtos">
          <h2 id="mais-produtos" className="text-h2">
            Outros produtos<span className="dot">.</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <ProductCard product={r} categoryName={catName[r.category] ?? r.category} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaBand location="product_final" />
    </>
  );
}
