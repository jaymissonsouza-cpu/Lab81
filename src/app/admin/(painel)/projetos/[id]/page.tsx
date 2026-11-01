import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProjectById, listCategories } from "@/lib/repos";
import { AdminForm } from "@/components/admin/AdminForm";
import { Check, Field, ImageManager, Section, Select, TextArea } from "@/components/admin/Fields";
import { deleteProjectAction, saveProjectAction } from "../../../actions";

export const metadata = { title: "Editar projeto" };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = id === "novo" ? null : getProjectById(Number(id));
  if (id !== "novo" && !p) notFound();
  const cats = listCategories("project");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/projetos" className="text-sm text-titanium hover:text-offwhite">← Projetos</Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">{p ? p.title : "Novo projeto"}</h1>
        {p?.published && <a href={`/projetos/${p.slug}`} target="_blank" className="text-sm text-orange">Ver no site ↗</a>}
      </div>
      <AdminForm action={saveProjectAction} className="mt-8" encType="multipart/form-data">
        {p && <input type="hidden" name="id" value={p.id} />}
        <Section title="Informações">
          <Field label="Título" name="title" defaultValue={p?.title} required />
          <Field label="Endereço (slug)" name="slug" defaultValue={p?.slug} hint="Deixe vazio para gerar a partir do título. Evite mudar depois de publicado." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Categoria" name="category" defaultValue={p?.category} options={cats.map((c) => ({ value: c.slug, label: c.name }))} />
            <Field label="Material" name="material" defaultValue={p?.material} placeholder="PLA, PETG…" />
            <Field label="Aplicação" name="application" defaultValue={p?.application} />
            <Field label="Ordem" name="sort" type="number" defaultValue={p?.sort ?? 0} />
          </div>
          <TextArea label="Resumo" name="summary" defaultValue={p?.summary} rows={2} hint="Aparece no topo da página e nos resultados de busca." />
          <TextArea label="Desafio" name="challenge" defaultValue={p?.challenge} />
          <TextArea label="Solução" name="solution" defaultValue={p?.solution} />
          <TextArea label="Descrição" name="description" defaultValue={p?.description} />
        </Section>
        <ImageManager images={p?.images ?? []} />
        <Section title="Publicação">
          <Check label="Publicado" name="published" defaultChecked={p?.published ?? true} />
          <Check label="Destaque na página inicial" name="featured" defaultChecked={p?.featured} />
          <Check label="Conteúdo demonstrativo" name="is_demo" defaultChecked={p?.is_demo} hint="Exibe o selo “Demonstrativo”. Desmarque quando for um projeto real." />
        </Section>
        <Section title="SEO" description="Opcional. Se vazio, usamos o título e o resumo.">
          <Field label="Título SEO" name="seo_title" defaultValue={p?.seo_title} maxLength={70} />
          <TextArea label="Meta description" name="seo_description" defaultValue={p?.seo_description} rows={2} />
        </Section>
      </AdminForm>
      {p && (
        <form action={deleteProjectAction} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <button className="text-sm text-red-400 hover:underline">Excluir projeto</button>
        </form>
      )}
    </div>
  );
}
