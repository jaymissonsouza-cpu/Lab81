import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/repos";
import { AdminForm } from "@/components/admin/AdminForm";
import { Check, Field, Section, TextArea } from "@/components/admin/Fields";
import { deletePostAction, savePostAction } from "../../../actions";

export const metadata = { title: "Editar artigo" };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = id === "novo" ? null : getPostById(Number(id));
  if (id !== "novo" && !p) notFound();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/blog" className="text-sm text-titanium hover:text-offwhite">← Blog</Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">{p ? p.title : "Novo artigo"}</h1>
        {p?.published && <a href={`/blog/${p.slug}`} target="_blank" className="text-sm text-orange">Ver no site ↗</a>}
      </div>
      <AdminForm action={savePostAction} className="mt-8" encType="multipart/form-data">
        {p && <input type="hidden" name="id" value={p.id} />}
        <Section title="Artigo">
          <Field label="Título (H1)" name="title" defaultValue={p?.title} required />
          <Field label="Endereço (slug)" name="slug" defaultValue={p?.slug} />
          <TextArea label="Resumo" name="excerpt" defaultValue={p?.excerpt} rows={2} />
          <TextArea
            label="Conteúdo (Markdown)"
            name="content"
            defaultValue={p?.content}
            rows={24}
            mono
            hint="Use ## para subtítulos (H2), ### para H3, **negrito**, listas com - e links [texto](/orcamento). HTML não é interpretado."
          />
        </Section>
        <Section title="Capa (opcional)">
          <Field label="Imagem atual" name="cover" defaultValue={p?.cover} placeholder="/media/arquivo.webp" />
          <div>
            <label htmlFor="cover_file" className="field-label">Enviar nova capa</label>
            <input id="cover_file" name="cover_file" type="file" accept="image/jpeg,image/png,image/webp" className="block text-sm text-titanium" />
          </div>
          <Field label="Texto alternativo da capa" name="cover_alt" defaultValue={p?.cover_alt} />
        </Section>
        <Section title="Publicação">
          <Check label="Publicado" name="published" defaultChecked={p?.published} />
          <Field label="Data de publicação" name="published_at" type="date" defaultValue={p?.published_at ?? ""} hint="Datas futuras ficam agendadas: o artigo só aparece a partir do dia." />
        </Section>
        <Section title="SEO">
          <Field label="Título SEO" name="seo_title" defaultValue={p?.seo_title} maxLength={70} />
          <TextArea label="Meta description" name="seo_description" defaultValue={p?.seo_description} rows={2} />
        </Section>
      </AdminForm>
      {p && (
        <form action={deletePostAction} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <button className="text-sm text-red-400 hover:underline">Excluir artigo</button>
        </form>
      )}
    </div>
  );
}
