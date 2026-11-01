import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getQuoteFile } from "@/lib/repos";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download de arquivos de orçamento — somente para administradores autenticados. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new NextResponse("Não autorizado", { status: 401 });
  const { id } = await params;
  const f = getQuoteFile(Number(id));
  if (!f) return new NextResponse("Não encontrado", { status: 404 });
  try {
    const buf = await fs.readFile(storagePath("quotes", f.protocol, f.stored_name));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        // Sempre como download (nunca renderizado no navegador)
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(f.original_name)}`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Arquivo indisponível", { status: 404 });
  }
}
