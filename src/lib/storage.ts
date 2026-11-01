import "server-only";
import fs from "node:fs";
import path from "node:path";

/** Raiz do armazenamento persistente (banco + arquivos). Fica fora de /public. */
export function storageRoot() {
  const dir = path.resolve(process.env.STORAGE_DIR || path.join(process.cwd(), "storage"));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function storagePath(...parts: string[]) {
  const root = storageRoot();
  const full = path.resolve(root, ...parts);
  if (!full.startsWith(root + path.sep) && full !== root) throw new Error("Caminho fora do armazenamento");
  return full;
}
