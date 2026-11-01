// O build "standalone" não copia /public nem os assets estáticos. Este passo deixa a pasta pronta para a VPS.
import fs from "node:fs";
const sa = ".next/standalone";
if (fs.existsSync(sa)) {
  fs.cpSync("public", `${sa}/public`, { recursive: true });
  fs.cpSync(".next/static", `${sa}/.next/static`, { recursive: true });
  console.log("standalone: public/ e .next/static copiados");
}
