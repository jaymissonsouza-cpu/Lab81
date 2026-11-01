import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { QUOTE_STATUSES, getQuote } from "@/lib/repos";
import { PROJECT_TYPE_LABEL } from "@/content/quote";
import { formatBytes, formatDate } from "@/lib/format";
import { whatsappUrl } from "@/lib/contact";
import { AdminForm } from "@/components/admin/AdminForm";
import { StatusPill } from "@/components/admin/Fields";
import { updateQuoteAction } from "../../../actions";

export const metadata = { title: "Orçamento" };

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const data = getQuote(Number(id));
  if (!data) notFound();
  const { quote: q, files, events } = data;
  const wa = q.phone ? whatsappUrl(q.phone, `Olá, ${q.name.split(" ")[0]}! Aqui é da LAB81 Studio, sobre o seu orçamento ${q.protocol}.`) : null;

  const rows: [string, string][] = [
    ["Tipo", PROJECT_TYPE_LABEL[q.project_type] ?? q.project_type],
    ["Dimensões", q.dimensions || "—"],
    ["Material", q.material || "—"],
    ["Cores", q.colors.join(", ") || "—"],
    ["Quantidade", String(q.quantity)],
    ["Prazo", q.deadline || "—"],
    ["Produto", q.product_slug || "—"],
  ];
  return (
    <div className="max-w-5xl">
      <Link href="/admin/orcamentos" className="text-sm text-titanium hover:text-offwhite">← Orçamentos</Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-3xl font-semibold">{q.protocol}</h1>
        <StatusPill tone="orange">{QUOTE_STATUSES[q.status]}</StatusPill>
      </div>
      <p className="mt-1 text-sm text-titanium">Recebido em {formatDate(q.created_at, { dateStyle: "long", timeStyle: "short" })}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-lg border border-line p-5">
            <h2 className="font-display text-lg font-semibold">Projeto</h2>
            <p className="mt-3 whitespace-pre-line text-titanium">{q.description}</p>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => (<div key={k}><dt className="text-titanium-600">{k}</dt><dd>{v}</dd></div>))}
            </dl>
            {q.notes && (<div className="mt-5"><h3 className="text-sm text-titanium-600">Observações</h3><p className="mt-1 whitespace-pre-line">{q.notes}</p></div>)}
          </section>

          <section className="rounded-lg border border-line p-5">
            <h2 className="font-display text-lg font-semibold">Arquivos ({files.length})</h2>
            {files.length ? (
              <ul className="mt-3 divide-y divide-line text-sm">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate">{f.original_name}</span>
                      <span className="text-xs text-titanium-600">{f.kind === "model" ? "Arquivo 3D" : "Referência"} · {formatBytes(f.size)}</span>
                    </span>
                    <a href={`/api/admin/arquivos/${f.id}`} className="btn btn-outline btn-sm shrink-0">Baixar</a>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-titanium">Nenhum arquivo enviado.</p>}
          </section>

          <section className="rounded-lg border border-line p-5">
            <h2 className="font-display text-lg font-semibold">Atendimento</h2>
            <AdminForm action={updateQuoteAction} className="mt-4">
              <input type="hidden" name="id" value={q.id} />
              <div>
                <label htmlFor="status" className="field-label">Status</label>
                <select id="status" name="status" defaultValue={q.status} className="field max-w-xs">
                  {Object.entries(QUOTE_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="internal_notes" className="field-label">Notas internas</label>
                <textarea id="internal_notes" name="internal_notes" defaultValue={q.internal_notes} rows={5} className="field" placeholder="Valores, prazos, decisões…" />
                <p className="field-hint">Visível apenas no painel.</p>
              </div>
            </AdminForm>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-line p-5 text-sm">
            <h2 className="font-display text-lg font-semibold">Cliente</h2>
            <p className="mt-3 text-base">{q.name}</p>
            <p><a href={`mailto:${q.email}?subject=${encodeURIComponent(`Orçamento ${q.protocol} — LAB81 Studio`)}`} className="text-orange break-all">{q.email}</a></p>
            {q.phone && <p className="text-titanium">{q.phone}</p>}
            {q.city && <p className="text-titanium">{q.city}</p>}
            <p className="mt-2 text-titanium-600">Prefere: {q.contact_preference || "—"}</p>
            <div className="mt-4 flex flex-col gap-2">
              {wa && <a href={wa} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Responder no WhatsApp</a>}
              <a href={`mailto:${q.email}?subject=${encodeURIComponent(`Orçamento ${q.protocol} — LAB81 Studio`)}`} className="btn btn-outline btn-sm">Responder por e-mail</a>
            </div>
            <p className="mt-4 text-xs text-titanium-600">Consentimento LGPD: {formatDate(q.consent_at.replace("T", " ").slice(0, 19), { dateStyle: "short", timeStyle: "short" })}</p>
          </section>
          {Object.keys(q.source).length > 0 && (
            <section className="rounded-lg border border-line p-5 text-sm">
              <h2 className="font-display text-lg font-semibold">Origem</h2>
              <dl className="mt-3 space-y-1.5">
                {Object.entries(q.source).filter(([k]) => k !== "ip_hash").map(([k, v]) => (<div key={k}><dt className="text-xs text-titanium-600">{k}</dt><dd className="break-all text-titanium">{v}</dd></div>))}
              </dl>
            </section>
          )}
          <section className="rounded-lg border border-line p-5 text-sm">
            <h2 className="font-display text-lg font-semibold">Histórico</h2>
            <ol className="mt-3 space-y-3">
              {events.map((e) => (<li key={e.id}><p>{e.detail}</p><p className="text-xs text-titanium-600">{formatDate(e.created_at, { dateStyle: "short", timeStyle: "short" })}</p></li>))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
