import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif" };

/** Serve imagens públicas enviadas pelo painel (portfólio, produtos, blog), armazenadas em $STORAGE_DIR/media. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const name = path.join("/");
  if (!/^[a-z0-9-]+\.(webp|jpe?g|png|avif)$/i.test(name)) return new NextResponse("Not found", { status: 404 });
  try {
    const file = await fs.readFile(storagePath("media", name));
    const ext = name.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "content-type": TYPES[ext],
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
