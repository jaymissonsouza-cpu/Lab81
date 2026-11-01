import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import sharp from "sharp";
import { storagePath } from "./storage";

const MAX_BYTES = 20 * 1024 * 1024;

/** Recebe uma imagem do painel, valida pelo conteúdo, redimensiona e salva em WebP. Retorna a URL pública /media/... */
export async function saveMediaImage(file: File): Promise<{ src: string } | { error: string }> {
  if (file.size === 0) return { error: "Arquivo vazio." };
  if (file.size > MAX_BYTES) return { error: "Imagem maior que 20 MB." };
  const input = Buffer.from(await file.arrayBuffer());
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input).metadata();
  } catch {
    return { error: `${file.name} não é uma imagem válida.` };
  }
  if (!meta.format || !["jpeg", "png", "webp", "avif", "heif", "tiff"].includes(meta.format)) {
    return { error: `Formato não suportado: ${meta.format ?? "desconhecido"}` };
  }
  const name = `${crypto.randomUUID()}.webp`;
  await fs.mkdir(storagePath("media"), { recursive: true });
  await sharp(input).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toFile(storagePath("media", name));
  return { src: `/media/${name}` };
}
