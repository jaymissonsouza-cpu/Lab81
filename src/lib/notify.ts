import "server-only";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { siteUrl } from "./site";

/**
 * Notificações opcionais. Os dados JÁ estão salvos no banco antes daqui:
 * se e-mail ou webhook falharem, nada é perdido (o painel continua sendo a fonte da verdade).
 */

function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_FROM && process.env.QUOTE_NOTIFY_EMAIL);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function mailer() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

async function sendMail(subject: string, text: string, replyTo?: string) {
  if (!smtpConfigured()) return "skipped" as const;
  await mailer().sendMail({ from: process.env.SMTP_FROM, to: process.env.QUOTE_NOTIFY_EMAIL, replyTo, subject, text });
  return "sent" as const;
}

async function postWebhook(event: string, payload: unknown) {
  const url = process.env.QUOTE_WEBHOOK_URL;
  if (!url) return "skipped" as const;
  const body = JSON.stringify({ event, sent_at: new Date().toISOString(), data: payload });
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.QUOTE_WEBHOOK_SECRET) {
    headers["x-lab81-signature"] = crypto.createHmac("sha256", process.env.QUOTE_WEBHOOK_SECRET).update(body).digest("hex");
  }
  const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Webhook respondeu ${res.status}`);
  return "sent" as const;
}

export type QuoteNotification = {
  id: number;
  protocol: string;
  project_type: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  material: string;
  quantity: number;
  description: string;
  files: { kind: string; name: string; size: number }[];
};

/** Retorna um resumo do que aconteceu, registrado no histórico do orçamento. */
export async function notifyQuote(q: QuoteNotification) {
  const results: string[] = [];
  const adminUrl = siteUrl(`/admin/orcamentos/${q.id}`);
  const text = [
    `Novo orçamento ${q.protocol}`,
    ``,
    `Tipo: ${q.project_type}`,
    `Cliente: ${q.name} <${q.email}> ${q.phone}`,
    q.city ? `Cidade: ${q.city}` : "",
    `Material: ${q.material || "não informado"} · Quantidade: ${q.quantity}`,
    ``,
    q.description,
    ``,
    `Arquivos: ${q.files.length ? q.files.map((f) => `${f.name} (${f.kind})`).join(", ") : "nenhum"}`,
    ``,
    `Abrir no painel: ${adminUrl}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  try {
    results.push(`e-mail: ${await sendMail(`[LAB81] Novo orçamento ${q.protocol}`, text, q.email)}`);
  } catch (e) {
    console.error("[notify] e-mail falhou", e);
    results.push("e-mail: falhou");
  }
  try {
    results.push(`webhook: ${await postWebhook("quote.created", { ...q, admin_url: adminUrl })}`);
  } catch (e) {
    console.error("[notify] webhook falhou", e);
    results.push("webhook: falhou");
  }
  return results.join(" · ");
}

export async function notifyContact(m: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  try {
    await sendMail(`[LAB81] Contato: ${m.subject || m.name}`, `${m.name} <${m.email}> ${m.phone ?? ""}\n\n${m.message}`, m.email);
  } catch (e) {
    console.error("[notify] e-mail de contato falhou", e);
  }
  try {
    await postWebhook("contact.created", m);
  } catch (e) {
    console.error("[notify] webhook de contato falhou", e);
  }
}
