import { requireAdmin } from "@/lib/auth";
import { listPageSeo } from "@/lib/repos";
import { AdminForm } from "@/components/admin/AdminForm";
import { savePageSeoAction } from "../../actions";

export const metadata = { title: "SEO das páginas" };

const PAGES = [
  { path: "/", label: "Página inicial" },
  { path: "/servicos", label: "Serviços" },
  { path: "/impressao-3d-recife", label: "Impressão 3D em Recife" },
  { path: "/impressao-3d-personalizada", label: "Impressão 3D personalizada" },
  { path: "/modelagem-3d", label: "Modelagem 3D" },
  { path: "/prototipagem-3d", label: "Prototipagem 3D" },
  { path: "/projetos", label: "Projetos" },
  { path: "/produtos", label: "Produtos" },
  { path: "/orcamento", label: "Orçamento" },
  { path: "/sobre", label: "Sobre" },
  { path: "/contato", label: "Contato" },
  { path: "/blog", label: "Blog" },
];

export default async function SeoPage() {
  await requireAdmin();
  const saved = Object.fromEntries(listPageSeo().map((r) => [r.path, r]));
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-semibold">SEO das páginas</h1>
      <p className="mt-2 text-titanium">
        Sobrescreva o título e a meta description de cada página. Deixe vazio para usar o texto padrão (já otimizado). Projetos, produtos e
        artigos têm campos de SEO próprios.
      </p>
      <AdminForm action={savePageSeoAction} className="mt-8">
        {PAGES.map((p) => (
          <fieldset key={p.path} className="rounded-lg border border-line p-4">
            <legend className="px-1 text-sm font-medium">
              {p.label} <span className="text-titanium-600">{p.path}</span>
            </legend>
            <input type="hidden" name="path" value={p.path} />
            <div className="grid gap-3">
              <input name="title" defaultValue={saved[p.path]?.title ?? ""} placeholder="Título (até ~60 caracteres)" maxLength={200} className="field" aria-label={`Título de ${p.label}`} />
              <textarea name="description" defaultValue={saved[p.path]?.description ?? ""} placeholder="Meta description (até ~155 caracteres)" rows={2} className="field" aria-label={`Descrição de ${p.label}`} />
            </div>
          </fieldset>
        ))}
      </AdminForm>
    </div>
  );
}
