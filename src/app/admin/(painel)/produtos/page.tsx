import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { AVAILABILITY_LABEL, listCategories, listProducts } from "@/lib/repos";
import { StatusPill } from "@/components/admin/Fields";

export const metadata = { title: "Produtos" };

export default async function AdminProducts() {
  await requireAdmin();
  const items = listProducts();
  const cat = Object.fromEntries(listCategories("product").map((c) => [c.slug, c.name]));
  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn btn-primary btn-sm">Novo produto</Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-carbon-900">
              {p.images[0] && <Image src={p.images[0].src} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/produtos/${p.id}`} className="font-medium hover:text-orange">{p.name}</Link>
              <p className="text-xs text-titanium-600">{cat[p.category] ?? p.category} · {AVAILABILITY_LABEL[p.availability]}{p.stock != null ? ` · estoque ${p.stock}` : ""}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {p.is_demo && <StatusPill>Demonstrativo</StatusPill>}
              <StatusPill tone={p.published ? "green" : "neutral"}>{p.published ? "Publicado" : "Rascunho"}</StatusPill>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
