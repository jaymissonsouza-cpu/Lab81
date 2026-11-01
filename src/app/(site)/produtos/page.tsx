import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { CtaBand } from "@/components/site/CtaBand";
import { listCategories, listProducts } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata({
    path: "/produtos",
    title: "Produtos autorais impressos em 3D",
    description:
      "Produtos autorais e personalizados da LAB81 Studio: chaveiros, lembranças, luminárias, vasos e objetos produzidos sob encomenda em impressão 3D.",
  });
}

export default function ProdutosPage() {
  const products = listProducts({ publishedOnly: true });
  const categories = listCategories("product");
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const groups = categories
    .map((c) => ({ ...c, items: products.filter((p) => p.category === c.slug) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Produtos autorais"
        title="Produtos autorais e personalizados."
        lead="Peças criadas no estúdio, produzidas sob encomenda em impressão 3D e personalizáveis em cor, medida, nome ou logomarca. Os pedidos são feitos por orçamento."
        crumbs={[{ name: "Produtos", path: "/produtos" }]}
      />
      <div className="container-site space-y-20">
        {products.some((p) => p.is_demo) && (
          <p className="max-w-3xl border-l-2 border-titanium/40 pl-4 text-sm text-titanium-600">
            Catálogo em construção: itens marcados como <strong className="font-medium text-titanium">Demonstrativo</strong> usam
            imagens ilustrativas. Disponibilidade, cores e valores são informados no orçamento.
          </p>
        )}
        {groups.map((g) => (
          <section key={g.slug} aria-labelledby={`cat-${g.slug}`}>
            <h2 id={`cat-${g.slug}`} className="text-h3 md:text-[2rem]">
              {g.name}
              <span className="dot">.</span>
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.items.map((p) => (
                <li key={p.slug} className="reveal">
                  <ProductCard product={p} categoryName={catName[p.category] ?? p.category} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="text-titanium">Novos produtos em breve.</p>}
      </div>
      <CtaBand
        title="Quer uma peça exclusiva?"
        text="Personalizamos produtos existentes ou criamos um objeto novo a partir da sua ideia."
        location="produtos_final"
      />
    </>
  );
}
