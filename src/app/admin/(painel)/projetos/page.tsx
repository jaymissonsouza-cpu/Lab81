import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { listCategories, listProjects } from "@/lib/repos";
import { StatusPill } from "@/components/admin/Fields";

export const metadata = { title: "Projetos" };

export default async function AdminProjects() {
  await requireAdmin();
  const items = listProjects();
  const cat = Object.fromEntries(listCategories("project").map((c) => [c.slug, c.name]));
  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Projetos do portfólio</h1>
        <Link href="/admin/projetos/novo" className="btn btn-primary btn-sm">Novo projeto</Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-carbon-900">
              {p.images[0] && <Image src={p.images[0].src} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/projetos/${p.id}`} className="font-medium hover:text-orange">{p.title}</Link>
              <p className="text-xs text-titanium-600">{cat[p.category] ?? p.category} · /projetos/{p.slug}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {p.is_demo && <StatusPill>Demonstrativo</StatusPill>}
              {p.featured && <StatusPill tone="orange">Destaque</StatusPill>}
              <StatusPill tone={p.published ? "green" : "neutral"}>{p.published ? "Publicado" : "Rascunho"}</StatusPill>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
