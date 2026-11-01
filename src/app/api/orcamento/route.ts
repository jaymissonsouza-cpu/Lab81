import crypto from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createQuote, getSettings, logQuoteEvent, protocolExists } from "@/lib/repos";
import { generateProtocol, removeQuoteDir, storeQuoteFiles, validateUpload, type ValidatedFile } from "@/lib/uploads";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyQuote } from "@/lib/notify";
import { PROJECT_TYPES, PROJECT_TYPE_LABEL, UPLOAD_LIMITS } from "@/content/quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MB = 1024 * 1024;

const schema = z.object({
  project_type: z.enum(PROJECT_TYPES.map((t) => t.value) as [string, ...string[]], { message: "Selecione o tipo de projeto." }),
  description: z.string().trim().min(10, "Descreva o projeto com pelo menos 10 caracteres.").max(5000),
  dimensions: z.string().trim().max(200).default(""),
  material: z.string().trim().max(80).default(""),
  colors: z.array(z.string().trim().max(60)).max(12).default([]),
  quantity: z.coerce.number().int().min(1, "Quantidade mínima: 1.").max(10000),
  deadline: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(5000).default(""),
  product_slug: z.string().trim().max(120).default(""),
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  company: z.string().trim().max(160).default(""),
  email: z.string().trim().email("Informe um e-mail válido.").max(160),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Informe o telefone com DDD.")
    .default(""),
  city: z.string().trim().max(120).default(""),
  contact_preference: z.string().trim().max(40).default(""),
  consent: z.literal(true, { message: "É necessário autorizar o uso dos dados para enviarmos a proposta." }),
  source: z.record(z.string(), z.string().max(300)).default({}),
});

function error(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, fields }, { status });
}

export async function POST(req: NextRequest) {
  // Proteção CSRF: só aceita envios do próprio site
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return error("Origem não permitida.", 403);

  const rl = rateLimit(`quote:${clientIp(req.headers)}`, 6, 15 * 60_000);
  if (!rl.ok) return error(`Muitas solicitações em pouco tempo. Tente novamente em ${Math.ceil(rl.retryAfter / 60)} min.`, 429);

  const length = Number(req.headers.get("content-length") || 0);
  if (length > (UPLOAD_LIMITS.maxTotalMb + 2) * MB) return error(`O envio excede o limite total de ${UPLOAD_LIMITS.maxTotalMb} MB.`, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error("Não foi possível ler o envio. Tente novamente.");
  }

  if (form.get("website")) return NextResponse.json({ ok: true, protocol: "L81-000000-OK" }); // honeypot

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? "{}"));
  } catch {
    return error("Dados do formulário inválidos.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
    return error("Confira os campos destacados.", 422, fields);
  }
  const data = parsed.data;

  // Arquivos
  const settings = getSettings();
  const models = form.getAll("model").filter((f): f is File => f instanceof File && f.size > 0);
  const refs = form.getAll("reference").filter((f): f is File => f instanceof File && f.size > 0);
  if (models.length > UPLOAD_LIMITS.maxModelFiles) return error(`Envie no máximo ${UPLOAD_LIMITS.maxModelFiles} arquivos 3D.`);
  if (refs.length > UPLOAD_LIMITS.maxReferenceFiles) return error(`Envie no máximo ${UPLOAD_LIMITS.maxReferenceFiles} imagens de referência.`);
  const total = [...models, ...refs].reduce((s, f) => s + f.size, 0);
  if (total > UPLOAD_LIMITS.maxTotalMb * MB) return error(`O envio excede o limite total de ${UPLOAD_LIMITS.maxTotalMb} MB.`, 413);

  const validated: ValidatedFile[] = [];
  for (const f of models) {
    const v = await validateUpload(f, "model", settings.max_model_mb * MB);
    if ("error" in v) return error(v.error, 422);
    validated.push(v);
  }
  for (const f of refs) {
    const v = await validateUpload(f, "reference", UPLOAD_LIMITS.maxReferenceMb * MB);
    if ("error" in v) return error(v.error, 422);
    validated.push(v);
  }

  let protocol = generateProtocol();
  for (let i = 0; protocolExists(protocol) && i < 5; i++) protocol = generateProtocol();

  // Persistência: arquivos primeiro, depois banco (com limpeza em caso de falha)
  let id: number;
  let stored: Awaited<ReturnType<typeof storeQuoteFiles>> = [];
  try {
    stored = await storeQuoteFiles(protocol, validated);
    const { consent: _c, ...rest } = data;
    void _c;
    id = createQuote(
      {
        ...rest,
        protocol,
        consent_at: new Date().toISOString(),
        source: { ...data.source, ip_hash: hashIp(clientIp(req.headers)), user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200) },
      },
      stored,
    );
  } catch (e) {
    console.error("[orcamento] falha ao salvar", e);
    await removeQuoteDir(protocol).catch(() => {});
    return error("Não foi possível registrar sua solicitação agora. Nenhum dado foi perdido do seu lado: tente novamente em instantes.", 500);
  }

  after(async () => {
    const summary = await notifyQuote({
      id,
      protocol,
      project_type: PROJECT_TYPE_LABEL[data.project_type] ?? data.project_type,
      name: data.company ? `${data.name} (${data.company})` : data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      material: data.material,
      quantity: data.quantity,
      description: data.description,
      files: stored.map((f) => ({ kind: f.kind, name: f.original_name, size: f.size })),
    });
    logQuoteEvent(id, "notificacao", summary);
  });

  return NextResponse.json({ ok: true, protocol }, { status: 201 });
}

function hashIp(ip: string) {
  // Guarda só um hash curto do IP (prevenção de abuso), não o IP em si.
  return crypto.createHash("sha256").update(`${ip}:${process.env.SESSION_SECRET ?? "lab81"}`).digest("hex").slice(0, 16);
}
