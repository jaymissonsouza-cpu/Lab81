// Gera o valor de ADMIN_PASSWORD_HASH.  Uso: npm run admin:hash -- "sua-senha-forte"
import crypto from "node:crypto";
const password = process.argv[2];
if (!password || password.length < 10) {
  console.error("Informe uma senha com pelo menos 10 caracteres: npm run admin:hash -- \"sua-senha\"");
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const [N, r, p] = [16384, 8, 1];
const hash = crypto.scryptSync(password, salt, 64, { N, r, p });
console.log(`scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${hash.toString("base64")}`);
