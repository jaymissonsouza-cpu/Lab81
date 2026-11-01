import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { QUOTE_STATUSES, listQuotes } from "@/lib/repos";
import { PROJECT_TYPE_LABEL } from "@/content/quote";

export const dynamic = "force-dynamic";

/** Exporta orçamentos em CSV (para planilhas ou importação em CRM). */
export async function GET() {
  if (!(await getSession())) return new NextResponse("Não autorizado", { status: 401 });
  const cols = ["protocol", "created_at", "status", "project_type", "name", "company", "email", "phone", "city", "material", "quantity", "deadline", "description"] as const;
  // Prefixo ' evita injeção de fórmulas em planilhas
  const esc = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [cols.join(";")];
  for (const q of listQuotes()) {
    lines.push(
      cols
        .map((c) => (c === "status" ? QUOTE_STATUSES[q.status] : c === "project_type" ? PROJECT_TYPE_LABEL[q.project_type] ?? q.project_type : q[c]))
        .map(esc)
        .join(";"),
    );
  }
  return new NextResponse("﻿" + lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orcamentos-lab81.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
