import { requireAdmin } from "@/lib/auth";
import { listContactMessages } from "@/lib/repos";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/admin/Fields";
import { setMessageStatusAction } from "../../actions";

export const metadata = { title: "Mensagens" };

export default async function MessagesPage() {
  await requireAdmin();
  const messages = listContactMessages();
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-semibold">Mensagens de contato</h1>
      <ul className="mt-8 space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="rounded-lg border border-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{m.name} <span className="text-sm font-normal text-titanium-600">· {formatDate(m.created_at, { dateStyle: "short", timeStyle: "short" })}</span></p>
                <p className="text-sm"><a href={`mailto:${m.email}`} className="text-orange">{m.email}</a>{m.phone ? ` · ${m.phone}` : ""}</p>
              </div>
              <StatusPill tone={m.status === "novo" ? "orange" : "neutral"}>{m.status}</StatusPill>
            </div>
            {m.subject && <p className="mt-3 font-medium">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-titanium">{m.message}</p>
            <form action={setMessageStatusAction} className="mt-4 flex gap-2">
              <input type="hidden" name="id" value={m.id} />
              {(["respondido", "arquivado", "novo"] as const).filter((s) => s !== m.status).map((s) => (
                <button key={s} name="status" value={s} className="btn btn-outline btn-sm">Marcar como {s}</button>
              ))}
            </form>
          </li>
        ))}
        {messages.length === 0 && <li className="text-titanium">Nenhuma mensagem ainda.</li>}
      </ul>
    </div>
  );
}
