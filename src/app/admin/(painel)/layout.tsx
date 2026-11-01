import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { countNewMessages, countQuotesByStatus } from "@/lib/repos";
import { logoutAction } from "../actions";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const newQuotes = countQuotesByStatus().find((s) => s.status === "novo")?.n ?? 0;
  const newMessages = countNewMessages();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-carbon-900 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/brand/lab81-simbolo.png" alt="" width={863} height={488} className="h-6 w-auto" />
            <span className="font-display text-sm font-semibold tracking-wide">Painel</span>
          </Link>
          <p className="hidden truncate pt-2 text-xs text-titanium-600 lg:block">{session.email}</p>
        </div>
        <AdminNav badges={{ "/admin/orcamentos": newQuotes, "/admin/mensagens": newMessages }} />
        <div className="flex gap-5 px-5 pb-4 text-sm lg:block lg:space-y-2 lg:py-6">
          <Link href="/" target="_blank" className="block text-titanium hover:text-offwhite">Ver site ↗</Link>
          <form action={logoutAction}>
            <button className="text-titanium hover:text-offwhite">Sair</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-5 py-8 md:px-10">{children}</div>
    </div>
  );
}
