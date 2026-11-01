import { PageHeader } from "@/components/site/PageHeader";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getProduct, getProject, getSettings } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/orcamento",
    title: "Orçamento de impressão 3D",
    description:
      "Solicite um orçamento de impressão 3D, modelagem ou prototipagem. Envie seu arquivo STL, OBJ, 3MF ou STEP, fotos e referências e receba uma proposta personalizada.",
  });
}

const TRUST: { icon: IconName; title: string; text: string }[] = [
  { icon: "cube", title: "Análise técnica", text: "Avaliamos arquivo, material e viabilidade antes de propor." },
  { icon: "layers", title: "Orientação sobre materiais", text: "Indicamos o material certo para o uso da peça." },
  { icon: "doc", title: "Proposta personalizada", text: "Valor e prazo definidos antes de qualquer fabricação." },
];

export default async function OrcamentoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const s = getSettings();
  const productSlug = typeof sp.produto === "string" ? sp.produto : "";
  const refSlug = typeof sp.referencia === "string" ? sp.referencia : "";
  const product = productSlug ? getProduct(productSlug, { publishedOnly: true }) : null;
  const reference = refSlug ? getProject(refSlug, { publishedOnly: true }) : null;

  return (
    <>
      <PageHeader
        eyebrow="Orçamento"
        title="Vamos criar seu projeto?"
        lead="Envie seu arquivo 3D ou sua ideia e receba uma proposta personalizada. Nossa equipe analisa seu projeto e indica a melhor solução."
        crumbs={[{ name: "Orçamento", path: "/orcamento" }]}
      />
      <div className="container-site grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <QuoteForm
            materials={s.materials}
            colors={s.colors}
            maxModelMb={s.max_model_mb}
            preset={{
              productSlug: product?.slug,
              productName: product?.name,
              referenceTitle: reference?.title,
            }}
          />
        </div>
        <aside className="lg:col-span-4" aria-label="Como funciona">
          <div className="space-y-px overflow-hidden rounded-lg border border-line bg-line lg:sticky lg:top-28">
            {TRUST.map((t) => (
              <div key={t.title} className="flex gap-4 bg-carbon p-6">
                <Icon name={t.icon} size={28} className="shrink-0 text-offwhite" strokeWidth={1.25} />
                <div>
                  <p className="font-display font-semibold">{t.title}</p>
                  <p className="mt-1 text-sm text-titanium">{t.text}</p>
                </div>
              </div>
            ))}
            <div className="bg-carbon-800 p-6 text-sm text-titanium">
              <p className="font-medium text-offwhite">Sem cálculo automático</p>
              <p className="mt-1">
                Cada peça é diferente. Por isso, o valor é definido após a análise do seu projeto, e você só aprova se fizer sentido.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
