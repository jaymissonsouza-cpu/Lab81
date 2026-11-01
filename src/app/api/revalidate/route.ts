import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Chamado pelo script de deploy (no próprio servidor) logo após publicar uma nova versão:
 * descarta as páginas geradas no build e as refaz com os dados reais do banco de produção.
 * Protegido pelo SESSION_SECRET (header x-revalidate-token).
 */
export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET ?? "";
  const token = req.headers.get("x-revalidate-token") ?? "";
  const ok =
    secret.length >= 32 &&
    token.length === secret.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
