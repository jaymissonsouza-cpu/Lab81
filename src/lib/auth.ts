import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

/**
 * Senha atual do painel: a alterada pelo próprio usuário (tabela settings) tem prioridade sobre a
 * senha inicial (variável ADMIN_PASSWORD_HASH, gerada no primeiro boot).
 */
function currentPasswordHash(): string | undefined {
  try {
    const row = db().prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").get() as { value: string } | undefined;
    if (row?.value) return row.value;
  } catch {
    /* banco indisponível: usa a variável */
  }
  return process.env.ADMIN_PASSWORD_HASH || undefined;
}

/** Impressão digital curta da senha: muda quando a senha muda e invalida sessões antigas. */
function passwordFingerprint() {
  return crypto.createHash("sha256").update(currentPasswordHash() ?? "").digest("base64url").slice(0, 16);
}

export function setAdminPassword(newPassword: string) {
  db()
    .prepare("INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(hashPassword(newPassword));
}

export function verifyAdminPassword(password: string) {
  const h = currentPasswordHash();
  return !!h && verifyPassword(password, h);
}

/**
 * Autenticação do painel: um administrador definido por variáveis de ambiente
 * (ADMIN_EMAIL + ADMIN_PASSWORD_HASH em scrypt) e sessão em cookie assinado (HMAC-SHA256, httpOnly).
 * Nenhuma credencial chega ao navegador.
 */
const COOKIE = "lab81_admin";
const MAX_AGE = 60 * 60 * 8; // 8 horas

export function authConfigured() {
  return !!(process.env.ADMIN_EMAIL && currentPasswordHash() && (process.env.SESSION_SECRET?.length ?? 0) >= 32);
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curto (mínimo 32 caracteres)");
  return s;
}

/** Formato: scrypt:N:r:p:saltBase64:hashBase64 (sem "$", que o carregador de .env interpretaria como variável) */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const N = 16384, r = 8, p = 1;
  const hash = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(salt, "base64"), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(actual, expected);
}

export function checkCredentials(email: string, password: string) {
  if (!authConfigured()) return false;
  const emailOk = crypto.timingSafeEqual(
    crypto.createHash("sha256").update(email.trim().toLowerCase()).digest(),
    crypto.createHash("sha256").update(process.env.ADMIN_EMAIL!.trim().toLowerCase()).digest(),
  );
  const passOk = verifyAdminPassword(password);
  return emailOk && passOk;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + MAX_AGE * 1000, v: passwordFingerprint() })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ email: string } | null> {
  if (!authConfigured()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e: string; x: number; v?: string };
    if (data.x < Date.now()) return null;
    if (data.v !== passwordFingerprint()) return null; // senha trocada: sessões antigas deixam de valer
    return { email: data.e };
  } catch {
    return null;
  }
}

/** Use no início de TODA página, ação e rota do painel. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
