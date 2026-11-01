import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AVAILABILITY_LABEL, getProductById, listCategories } from "@/lib/repos";
import { AdminForm } from "@/components/admin/AdminForm";
import { Check, Field, ImageManager, Section, Select, TextArea } from "@/components/admin/Fields";
import { deleteProductAction, saveProductAction } from "../../../actions";

export const metadata = { title: "Editar produto" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = id === "novo" ? null : getProductById(Number(id));
  if (id !== "novo" && !p) notFound();
  const cats = listCategories("product");
  const price = p?.price_cents != null ? (p.price_cents / 100).toFixed(2).replace(".", ",") : "";
  return (
    <div className="max-w-3xl">
      <Link href="/admin/produtos" className="text-sm text-titanium hover:text-offwhite">← Produtos</Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">{p ? p.name : "Novo produto"}</h1>
        {p?.published && <a href={`/produtos/${p.slug}`} target="_blank" className="text-sm text-orange">Ver no site ↗</a>}
      </div>
      <AdminForm action={saveProductAction} className="mt-8" encType="multipart/form-data">
        {p && <input type="hidden" name="id" value={p.id} />}
        <Section title="Informações">
          <Field label="Nome" name="name" defaultValue={p?.name} required />
          <Field label="Endereço (slug)" name="slug" defaultValue={p?.slug} hint="Deixe vazio para gerar a partir do nome." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Categoria" name="category" defaultValue={p?.category} options={cats.map((c) => ({ value: c.slug, label: c.name }))} />
            <Field label="Ordem" name="sort" type="number" defaultValue={p?.sort ?? 0} />
          </div>
          <TextArea label="Resumo" name="summary" defaultValue={p?.summary} rows={2} />
          <TextArea label="Descrição" name="description" defaultValue={p?.description} rows={5} />
        </Section>
        <Section title="Variações" description="Separe os valores por vírgula. Preparado para futuras variações de cor/tamanho no e-commerce.">
          <Field label="Materiais" name="materials" defaultValue={p?.materials.join(", ")} placeholder="PLA, PETG" />
          <Field label="Cores" name="colors" defaultValue={p?.colors.join(", ")} placeholder="Laranja, Preto, Areia" />
          <Field label="Tamanhos" name="sizes" defaultValue={p?.sizes.join(", ")} placeholder="P (15 cm), M (20 cm)" />
          <Check label="Aceita personalização" name="customizable" defaultChecked={p?.customizable} />
        </Section>
        <Section title="Comercial" description="Não há checkout no site: o pedido é feito por orçamento. Preço e estoque ficam prontos para uma futura loja.">
          <div className="grid gap-5 sm:grid-cols-3">
            <Select label="Disponibilidade" name="availability" defaultValue={p?.availability ?? "sob_consulta"} options={Object.entries(AVAILABILITY_LABEL).map(([value, label]) => ({ value, label }))} />
            <Field label="Preço de referência (R$)" name="price" defaultValue={price} placeholder="Ex.: 189,90" />
            <Field label="Estoque" name="stock" type="number" defaultValue={p?.stock ?? ""} hint="Vazio = não controlado" />
          </div>
          <Check label="Exibir preço no site" name="show_price" defaultChecked={p?.show_price} hint="Só aparece se houver preço preenchido." />
        </Section>
        <ImageManager images={p?.images ?? []} />
        <Section title="Publicação">
          <Check label="Publicado" name="published" defaultChecked={p?.published ?? true} />
          <Check label="Conteúdo demonstrativo" name="is_demo" defaultChecked={p?.is_demo} hint="Exibe o selo “Demonstrativo”." />
        </Section>
        <Section title="SEO">
          <Field label="Título SEO" name="seo_title" defaultValue={p?.seo_title} maxLength={70} />
          <TextArea label="Meta description" name="seo_description" defaultValue={p?.seo_description} rows={2} />
        </Section>
      </AdminForm>
      {p && (
        <form action={deleteProductAction} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <button className="text-sm text-red-400 hover:underline">Excluir produto</button>
        </form>
      )}
    </div>
  );
}
