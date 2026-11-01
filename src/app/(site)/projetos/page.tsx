import { PageHeader } from "@/components/site/PageHeader";
import { PortfolioGrid } from "@/components/site/PortfolioGrid";
import { toPortfolioItem } from "@/components/site/ProjectTile";
import { CtaBand } from "@/components/site/CtaBand";
import { listCategories, listProjects } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata({
    path: "/projetos",
    title: "Projetos de impressão 3D: decoração, peças técnicas e protótipos",
    description:
      "Portfólio da LAB81 Studio: peças decorativas, peças técnicas, protótipos e projetos personalizados impressos em 3D em Recife.",
  });
}

export default function ProjetosPage() {
  const projects = listProjects({ publishedOnly: true });
  const categories = listCategories("project").map((c) => ({ slug: c.slug, name: c.name }));
  const hasDemo = projects.some((p) => p.is_demo);
  return (
    <>
      <PageHeader
        eyebrow="Portfólio"
        title="Projetos que ganham forma."
        lead="Ideias reais transformadas em objetos únicos, com design, tecnologia e precisão."
        crumbs={[{ name: "Projetos", path: "/projetos" }]}
      />
      <section className="container-site" aria-label="Galeria de projetos">
        {hasDemo && (
          <p className="mb-8 max-w-3xl border-l-2 border-titanium/40 pl-4 text-sm text-titanium-600">
            Itens marcados como <strong className="font-medium text-titanium">Demonstrativo</strong> usam imagens ilustrativas e
            exemplos de aplicação. Eles serão substituídos pelos projetos executados pela LAB81.
          </p>
        )}
        <PortfolioGrid items={projects.map(toPortfolioItem)} categories={categories} syncUrl />
      </section>
      <CtaBand title="Quer um projeto parecido?" text="Envie sua referência e receba uma proposta personalizada." location="projetos_final" />
    </>
  );
}
