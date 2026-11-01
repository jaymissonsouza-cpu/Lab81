// Gera recortes PROVISÓRIOS a partir das referências visuais fornecidas.
// Uso: node scripts/prepare-reference-assets.mjs <logo.png> <home.png> <paginas.png>
// Substitua os arquivos gerados em public/demo e public/brand pelas versões oficiais assim que existirem.
import sharp from "sharp";
import path from "node:path";

const [logoSrc, homeSrc, pagesSrc] = process.argv.slice(2);
if (!logoSrc || !homeSrc || !pagesSrc) {
  console.error("Uso: node scripts/prepare-reference-assets.mjs <logo.png> <home.png> <paginas.png>");
  process.exit(1);
}
const out = (p) => path.join(process.cwd(), "public", p);

const crops = [
  // [origem, nome, left, top, width, height]
  [homeSrc, "demo/luminaria-parametrica-laranja.webp", 768, 76, 700, 444],
  [homeSrc, "demo/luminaria-parametrica-areia.webp", 63, 533, 258, 180],
  [homeSrc, "demo/suporte-tecnico-preto.webp", 591, 533, 259, 180],
  [homeSrc, "demo/carcaca-aerodinamica-laranja.webp", 1115, 533, 289, 180],
  [pagesSrc, "demo/luminaria-torcida-laranja.webp", 52, 447, 242, 180],
  [pagesSrc, "demo/suporte-tecnico-preto-2.webp", 310, 447, 240, 180],
  [pagesSrc, "demo/vaso-escultural-areia.webp", 566, 447, 226, 180],
  [pagesSrc, "demo/carcaca-aerodinamica-2.webp", 52, 691, 242, 148],
  [pagesSrc, "demo/organizador-modular-areia.webp", 310, 691, 240, 148],
  [pagesSrc, "demo/peca-funcional-preta.webp", 566, 691, 226, 148],
  [pagesSrc, "demo/luminaria-detalhe-vertical.webp", 1374, 121, 272, 272],
];

for (const [src, name, left, top, width, height] of crops) {
  await sharp(src).extract({ left, top, width, height }).webp({ quality: 90 }).toFile(out(name));
  console.log("ok", name);
}

// Logo: remove o fundo escuro (carbon) e gera PNG transparente.
async function transparent(src, region, name) {
  const { data, info } = await sharp(src).extract(region).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b);
    // fundo ~#111719: torna transparente com borda suavizada
    const a = Math.max(0, Math.min(255, ((max - 40) / 60) * 255));
    data[i + 3] = a;
  }
  await sharp(data, { raw: info }).trim().png({ compressionLevel: 9 }).toFile(out(name));
  console.log("ok", name);
}
await transparent(logoSrc, { left: 190, top: 240, width: 880, height: 510 }, "brand/lab81-simbolo.png");
await transparent(logoSrc, { left: 180, top: 785, width: 900, height: 235 }, "brand/lab81-wordmark.png");
await transparent(logoSrc, { left: 150, top: 230, width: 950, height: 800 }, "brand/lab81-logo-completo.png");

// Ícones do app a partir do logo original (fundo carbon).
const icon = sharp(logoSrc).extract({ left: 140, top: 180, width: 980, height: 600 });
const iconBuf = await icon.resize(440, 270, { fit: "contain", background: "#111719" }).toBuffer();
for (const size of [512, 192, 180, 32]) {
  const pad = Math.round(size * 0.12);
  await sharp({ create: { width: size, height: size, channels: 4, background: "#111719" } })
    .composite([{ input: await sharp(iconBuf).resize(size - pad * 2, size - pad * 2, { fit: "contain", background: "#111719" }).toBuffer(), left: pad, top: pad }])
    .png()
    .toFile(out(`brand/icon-${size}.png`));
}
console.log("ok icons");

// Imagem Open Graph 1200x630
const ogLamp = await sharp(homeSrc).extract({ left: 768, top: 76, width: 700, height: 444 }).resize(760, 630, { fit: "cover" }).toBuffer();
const ogLogo = await sharp(out("brand/lab81-logo-completo.png")).resize(340, null).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#111719" } })
  .composite([
    { input: ogLamp, left: 440, top: 0 },
    { input: Buffer.from(`<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0.33" stop-color="#111719"/><stop offset="0.55" stop-color="#111719" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="80" y="520" width="90" height="4" fill="#F26A21"/></svg>`), left: 0, top: 0 },
    { input: ogLogo, left: 80, top: 160 },
  ])
  .jpeg({ quality: 85 })
  .toFile(out("brand/og-lab81.jpg"));
console.log("ok og");
