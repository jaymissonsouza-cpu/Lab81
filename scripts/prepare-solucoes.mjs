// Recorta a área dos produtos das artes da LAB81 (sem títulos e botões) para usar no site.
// Uso: node scripts/prepare-solucoes.mjs <pasta-com-as-artes>
import sharp from "sharp";
import path from "node:path";
const dir = process.argv[2];
const out = (n) => path.join(process.cwd(), "public/img/solucoes", n);
// [arquivo, nome, left, top, width, height]
const crops = [
  ["79468c1c-image.png", "solucoes-mix.webp", 0, 560, 1122, 600],
  ["5ccfa617-image.png", "pecas-tecnicas.webp", 0, 590, 1122, 600],
  ["b8dcd887-image.png", "dispositivo-fixacao.webp", 0, 460, 1122, 740],
  ["8ff0e47b-image.png", "prototipo-carcaca.webp", 0, 520, 1122, 690],
  ["e5c656ff-image.png", "organizador-mesa.webp", 505, 560, 617, 620],
  ["2a294ab1-image.png", "display-cosmeticos.webp", 420, 540, 702, 680],
  ["85fae43a-image.png", "letreiro-3d.webp", 0, 580, 1122, 580],
  ["c0a503d0-image.png", "porta-qr-code.webp", 525, 565, 597, 630],
  ["a0ea707c-image.png", "brindes-corporativos.webp", 0, 800, 1122, 480],
  ["8e659c16-image.png", "expositor-modular.webp", 0, 690, 1122, 530],
  ["9655b07f-image.png", "numeradores-mesa.webp", 0, 640, 1122, 560],
  ["651d63c5-image.png", "porta-guardanapos.webp", 0, 520, 1122, 690],
  ["158e4075-image.png", "souvenirs-recife.webp", 0, 480, 1122, 720],
  ["7b721049-image.png", "trofeus.webp", 0, 470, 1122, 730],
  ["5233611d-image.png", "lembrancinhas-casamento.webp", 0, 750, 1122, 490],
  ["92db7948-image.png", "topo-de-bolo.webp", 0, 470, 1122, 720],
];
for (const [f, name, left, top, width, height] of crops) {
  await sharp(path.join(dir, f)).extract({ left, top, width, height }).webp({ quality: 86 }).toFile(out(name));
}
console.log("ok", crops.length);
