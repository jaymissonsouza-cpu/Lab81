import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { QUOTE_STATUSES, listQuotes } from "@/lib/repos";
import { PROJECT_TYPE_LABEL } from "@/content/quote";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/admin/Fields";

export const metadata = { title: "Orçamentos" };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status = "", q = "" } = await searchParams;
  const quotes = listQuotes({ status, q });
  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Orçamentos</h1>
        <a href="/api/admin/orcamentos.csv" className="btn btn-outline btn-sm">Exportar CSV</a>
      </div>
      <form className="mt-6 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por protocolo, nome, empresa ou e-mail" className="field max-w-sm" />
        <select name="status" defaultValue={status} className="field max-w-[14rem]">
          <option value="">Todos os status</option>
          {Object.entries(QUOTE_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn btn-outline btn-sm">Filtrar</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="bg-carbon-800 text-xs uppercase tracking-wider text-titanium-600">
            <tr><th className="p-3">Protocolo</th><th className="p-3">Cliente</th><th className="p-3">Tipo</th><th className="p-3">Material</th><th className="p-3">Qtd.</th><th className="p-3">Status</th><th className="p-3">Recebido</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {quotes.map((x) => (
              <tr key={x.id} className="hover:bg-carbon-800/60">
                <td className="p-3"><Link href={`/admin/orcamentos/${x.id}`} className="font-medium hover:text-orange">{x.protocol}</Link></td>
                <td className="p-3"><span className="block">{x.name}{x.company ? ` · ${x.company}` : ""}</span><span className="text-xs text-titanium-600">{x.email}</span></td>
                <td className="p-3 text-titanium">{PROJECT_TYPE_LABEL[x.project_type] ?? x.project_type}</td>
                <td className="p-3 text-titanium">{x.material || "—"}</td>
                <td className="p-3 text-titanium">{x.quantity}</td>
                <td className="p-3"><StatusPill tone={x.status === "novo" ? "orange" : x.status === "concluido" ? "green" : x.status === "cancelado" ? "red" : "neutral"}>{QUOTE_STATUSES[x.status]}</StatusPill></td>
                <td className="p-3 text-titanium">{formatDate(x.created_at, { dateStyle: "short", timeStyle: "short" })}</td>
              </tr>
            ))}
            {quotes.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-titanium">Nenhum orçamento encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
