import Link from "next/link";
import { requireAdmin, authConfigured } from "@/lib/auth";
import { QUOTE_STATUSES, countNewMessages, countQuotesByStatus, getSettings, listProducts, listProjects, listQuotes } from "@/lib/repos";
import { PROJECT_TYPE_LABEL } from "@/content/quote";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/admin/Fields";

export const metadata = { title: "Visão geral" };

export default async function AdminHome() {
  await requireAdmin();
  const counts = Object.fromEntries(countQuotesByStatus().map((c) => [c.status, c.n]));
  const recent = listQuotes().slice(0, 8);
  const s = getSettings();
  const demoProjects = listProjects().filter((p) => p.is_demo).length;
  const demoProducts = listProducts().filter((p) => p.is_demo).length;

  const pending = [
    !s.whatsapp && "Número de WhatsApp",
    !s.email && "E-mail comercial",
    !s.instagram && "Instagram",
    !s.legal_name && "Razão social / CNPJ (rodapé e política de privacidade)",
    s.colors.length === 0 && "Cores de filamento disponíveis (o formulário mostra campo livre enquanto vazio)",
    demoProjects > 0 && `${demoProjects} projeto(s) demonstrativo(s) para substituir por trabalhos reais`,
    demoProducts > 0 && `${demoProducts} produto(s) demonstrativo(s) para revisar`,
    !process.env.NEXT_PUBLIC_SITE_URL && "NEXT_PUBLIC_SITE_URL (domínio oficial)",
    !process.env.SMTP_HOST && "SMTP para receber orçamentos por e-mail (opcional)",
    !process.env.NEXT_PUBLIC_GTM_ID && "Google Tag Manager (opcional)",
    !authConfigured() && "Credenciais do painel",
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">Visão geral</h1>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["novo", "em_analise", "proposta_enviada", "em_producao"] as const).map((k) => (
          <li key={k}>
            <Link href={`/admin/orcamentos?status=${k}`} className="block rounded-lg border border-line bg-carbon-800 p-5 hover:border-line-strong">
              <p className="text-xs uppercase tracking-[0.18em] text-titanium-600">{QUOTE_STATUSES[k]}</p>
              <p className="mt-2 font-display text-3xl font-bold">{counts[k] ?? 0}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-titanium">
        Mensagens de contato novas: <Link href="/admin/mensagens" className="text-orange">{countNewMessages()}</Link>
      </p>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_22rem]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Orçamentos recentes</h2>
            <Link href="/admin/orcamentos" className="text-sm text-orange">Ver todos</Link>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-carbon-800 text-xs uppercase tracking-wider text-titanium-600">
                <tr><th className="p-3">Protocolo</th><th className="p-3">Cliente</th><th className="p-3">Tipo</th><th className="p-3">Status</th><th className="p-3">Data</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((q) => (
                  <tr key={q.id} className="hover:bg-carbon-800/60">
                    <td className="p-3"><Link href={`/admin/orcamentos/${q.id}`} className="font-medium text-offwhite hover:text-orange">{q.protocol}</Link></td>
                    <td className="p-3 text-titanium">{q.name}</td>
                    <td className="p-3 text-titanium">{PROJECT_TYPE_LABEL[q.project_type] ?? q.project_type}</td>
                    <td className="p-3"><StatusPill tone={q.status === "novo" ? "orange" : "neutral"}>{QUOTE_STATUSES[q.status]}</StatusPill></td>
                    <td className="p-3 text-titanium">{formatDate(q.created_at, { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-titanium">Nenhum orçamento ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-lg border border-line p-5">
          <h2 className="font-display text-lg font-semibold">Pendências de configuração</h2>
          {pending.length ? (
            <ul className="mt-4 space-y-2 text-sm text-titanium">
              {pending.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 h-1 w-2 shrink-0 bg-orange" />{p}</li>)}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-emerald-300">Tudo configurado.</p>
          )}
          <Link href="/admin/configuracoes" className="btn btn-outline btn-sm mt-5">Configurações</Link>
        </section>
      </div>
    </div>
  );
}
