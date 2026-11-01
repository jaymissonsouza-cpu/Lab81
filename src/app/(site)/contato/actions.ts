"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createContactMessage } from "@/lib/repos";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyContact } from "@/lib/notify";

export type ContactState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(160),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Escreva uma mensagem com pelo menos 10 caracteres.").max(5000),
  consent: z.literal("on", { message: "É necessário concordar com o uso dos dados para responder." }),
});

export async function sendContactMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot anti-spam: campo invisível que pessoas não preenchem
  if (form.get("website")) return { ok: true, message: "Mensagem enviada." };

  const h = await headers();
  const rl = rateLimit(`contact:${clientIp(h)}`, 5, 10 * 60_000);
  if (!rl.ok) return { ok: false, message: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Confira os campos destacados.", errors };
  }
  const { consent: _consent, ...data } = parsed.data;
  void _consent;
  try {
    createContactMessage({ ...data, consent_at: new Date().toISOString() });
  } catch (e) {
    console.error("[contato] falha ao salvar", e);
    return { ok: false, message: "Não foi possível enviar agora. Tente novamente em instantes." };
  }
  void notifyContact(data);
  return { ok: true, message: "Mensagem enviada! Responderemos pelo e-mail informado." };
}
