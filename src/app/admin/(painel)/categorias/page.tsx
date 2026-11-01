import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/repos";
import { AdminForm } from "@/components/admin/AdminForm";
import { deleteCategoryAction, saveCategoryAction } from "../../actions";

export const metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  await requireAdmin();
  const groups = [
    { type: "project" as const, title: "Categorias de projetos", items: listCategories("project") },
    { type: "product" as const, title: "Categorias de produtos", items: listCategories("product") },
  ];
  return (
    <div className="max-w-4xl space-y-12">
      <h1 className="font-display text-3xl font-semibold">Categorias</h1>
      {groups.map((g) => (
        <section key={g.type}>
          <h2 className="font-display text-xl font-semibold">{g.title}</h2>
          <ul className="mt-4 space-y-3">
            {g.items.map((c) => (
              <li key={c.id} className="rounded-lg border border-line p-4">
                <AdminForm action={saveCategoryAction} className="!space-y-3" submitLabel="Salvar">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="type" value={g.type} />
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
                    <input name="name" defaultValue={c.name} className="field" aria-label="Nome" />
                    <input name="slug" defaultValue={c.slug} className="field" aria-label="Slug" />
                    <input name="sort" type="number" defaultValue={c.sort} className="field" aria-label="Ordem" />
                  </div>
                </AdminForm>
                <AdminForm action={deleteCategoryAction} className="!space-y-0" submitLabel="Excluir categoria">
                  <input type="hidden" name="id" value={c.id} />
                </AdminForm>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-dashed border-line-strong p-4">
            <p className="mb-3 text-sm text-titanium">Nova categoria</p>
            <AdminForm action={saveCategoryAction} className="!space-y-3" submitLabel="Adicionar">
              <input type="hidden" name="type" value={g.type} />
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
                <input name="name" placeholder="Nome" className="field" aria-label="Nome" />
                <input name="slug" placeholder="slug (opcional)" className="field" aria-label="Slug" />
                <input name="sort" type="number" placeholder="Ordem" className="field" aria-label="Ordem" />
              </div>
            </AdminForm>
          </div>
        </section>
      ))}
      <p className="text-sm text-titanium-600">Alterar o slug de uma categoria em uso não atualiza os itens já cadastrados. Uma categoria só pode ser excluída quando não estiver em uso.</p>
    </div>
  );
}
