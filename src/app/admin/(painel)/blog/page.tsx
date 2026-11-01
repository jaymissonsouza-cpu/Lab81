import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listPosts } from "@/lib/repos";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/admin/Fields";

export const metadata = { title: "Blog" };

export default async function AdminBlog() {
  await requireAdmin();
  const posts = listPosts();
  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Blog</h1>
        <Link href="/admin/blog/novo" className="btn btn-primary btn-sm">Novo artigo</Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-orange">{p.title}</Link>
              <p className="text-xs text-titanium-600">/blog/{p.slug} · {formatDate(p.published_at)}</p>
            </div>
            <StatusPill tone={p.published ? "green" : "neutral"}>{p.published ? "Publicado" : "Rascunho"}</StatusPill>
          </li>
        ))}
      </ul>
    </div>
  );
}
