import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { storagePath } from "./storage";
import { MODEL_EXTENSIONS, REFERENCE_EXTENSIONS, fileExtension } from "@/content/quote";

export type FileKind = "model" | "reference";

const MIME: Record<string, string> = {
  stl: "model/stl",
  obj: "model/obj",
  "3mf": "model/3mf",
  step: "model/step",
  stp: "model/step",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

const startsWith = (buf: Buffer, sig: number[], offset = 0) => sig.every((b, i) => buf[offset + i] === b);
const asciiHead = (buf: Buffer, n = 4096) => buf.subarray(0, n).toString("latin1");

/**
 * Confere o conteúdo real do arquivo (assinatura/estrutura), não apenas a extensão.
 * Evita que executáveis ou HTML sejam aceitos com extensão trocada.
 */
function contentMatches(ext: string, buf: Buffer): boolean {
  switch (ext) {
    case "stl": {
      if (buf.length >= 84) {
        const triangles = buf.readUInt32LE(80);
        if (84 + triangles * 50 === buf.length) return true; // STL binário
      }
      const head = asciiHead(buf, 512).trimStart().toLowerCase();
      return head.startsWith("solid") && /facet|endsolid/.test(asciiHead(buf, 1 << 16).toLowerCase());
    }
    case "obj": {
      const head = asciiHead(buf, 1 << 16);
      if (head.includes("\u0000")) return false;
      return /^(v|vn|vt|f|o|g|mtllib|usemtl|#)\s/m.test(head) && /^v\s+[-\d.]/m.test(head);
    }
    case "3mf":
      return startsWith(buf, [0x50, 0x4b, 0x03, 0x04]); // contêiner ZIP
    case "step":
    case "stp":
      return asciiHead(buf, 256).trimStart().startsWith("ISO-10303-21");
    case "jpg":
    case "jpeg":
      return startsWith(buf, [0xff, 0xd8, 0xff]);
    case "png":
      return startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "webp":
      return startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && buf.subarray(8, 12).toString("latin1") === "WEBP";
    case "pdf":
      return asciiHead(buf, 1024).includes("%PDF-");
    default:
      return false;
  }
}

export type ValidatedFile = { kind: FileKind; originalName: string; ext: string; mime: string; buffer: Buffer };

export async function validateUpload(file: File, kind: FileKind, maxBytes: number): Promise<ValidatedFile | { error: string }> {
  const originalName = sanitizeName(file.name || "arquivo");
  const ext = fileExtension(originalName);
  const allowed: readonly string[] = kind === "model" ? MODEL_EXTENSIONS : REFERENCE_EXTENSIONS;
  if (!allowed.includes(ext)) return { error: `Formato não aceito: ${originalName}` };
  if (file.size === 0) return { error: `Arquivo vazio: ${originalName}` };
  if (file.size > maxBytes) return { error: `${originalName} excede o limite de ${Math.round(maxBytes / 1024 / 1024)} MB` };
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!contentMatches(ext, buffer)) return { error: `O conteúdo de ${originalName} não corresponde a um arquivo .${ext} válido` };
  return { kind, originalName, ext, mime: MIME[ext], buffer };
}

export function sanitizeName(name: string) {
  return name
    .normalize("NFC")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .slice(-150);
}

/** Grava os arquivos em $STORAGE_DIR/quotes/<protocolo>/ com nomes aleatórios (o nome original fica só no banco). */
export async function storeQuoteFiles(protocol: string, files: ValidatedFile[]) {
  const dir = storagePath("quotes", protocol);
  await fs.mkdir(dir, { recursive: true });
  const stored: { kind: FileKind; original_name: string; stored_name: string; mime: string; size: number }[] = [];
  for (const f of files) {
    const storedName = `${crypto.randomUUID()}.${f.ext}`;
    await fs.writeFile(storagePath("quotes", protocol, storedName), f.buffer, { flag: "wx", mode: 0o640 });
    stored.push({ kind: f.kind, original_name: f.originalName, stored_name: storedName, mime: f.mime, size: f.buffer.length });
  }
  return stored;
}

export async function removeQuoteDir(protocol: string) {
  await fs.rm(storagePath("quotes", protocol), { recursive: true, force: true });
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateProtocol(date = new Date()) {
  const d = date.toLocaleDateString("en-CA", { timeZone: "America/Recife" }).replace(/-/g, "").slice(2);
  const bytes = crypto.randomBytes(5);
  const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `L81-${d}-${code}`;
}
