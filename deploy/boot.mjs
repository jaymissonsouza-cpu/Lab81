// Supervisor do site dentro do contêiner Docker do VPS.
//
// 1. Baixa a versão publicada (asset "release.tgz" da release "producao" no GitHub).
// 2. Inicia o servidor Next.js e confere se respondeu.
// 3. A cada CHECK_INTERVAL segundos verifica se há versão nova; se houver, troca e,
//    se a nova não responder, volta para a anterior.
//
// Assim cada push na branch main (que gera uma nova release pelo GitHub Actions)
// entra no ar sozinho, sem acesso SSH nem segredos no GitHub.
// Repositório privado: defina GH_TOKEN (token de leitura) no ambiente do projeto.

import { spawn, execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const REPO = process.env.RELEASE_REPO || "jaymissonsouza-cpu/Lab81";
const TAG = process.env.RELEASE_TAG || "producao";
const INTERVAL = Math.max(60, Number(process.env.CHECK_INTERVAL || 300)) * 1000;
const ROOT = "/srv/releases";
const PORT = 3000;

/**
 * Configuração automática (para instalar sem digitar variáveis, ex.: pelo celular):
 * se SESSION_SECRET / ADMIN_PASSWORD_HASH não forem informados, são gerados uma única vez e guardados
 * no volume de dados (/data/.lab81-secrets.json). A senha inicial do painel aparece nos logs do contêiner.
 */
const DATA = process.env.STORAGE_DIR || "/data";
const SECRETS_FILE = path.join(DATA, ".lab81-secrets.json");

function scrypt(password) {
  const salt = crypto.randomBytes(16);
  const [N, r, p] = [16384, 8, 1];
  const hash = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

function ensureSecrets() {
  fs.mkdirSync(DATA, { recursive: true });
  let s = {};
  try {
    s = JSON.parse(fs.readFileSync(SECRETS_FILE, "utf8"));
  } catch {}
  let changed = false;
  if (!process.env.SESSION_SECRET && !s.SESSION_SECRET) {
    s.SESSION_SECRET = crypto.randomBytes(32).toString("hex");
    changed = true;
  }
  if (!process.env.ADMIN_PASSWORD_HASH && !s.ADMIN_PASSWORD_HASH) {
    // senha legível: 4 grupos de 4 caracteres sem ambiguidade (ex.: K7QM-2XPA-...)
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const raw = Array.from(crypto.randomBytes(16), (b) => alphabet[b % alphabet.length]).join("");
    s.ADMIN_INITIAL_PASSWORD = raw.match(/.{4}/g).join("-");
    s.ADMIN_PASSWORD_HASH = scrypt(s.ADMIN_INITIAL_PASSWORD);
    changed = true;
  }
  if (changed) fs.writeFileSync(SECRETS_FILE, JSON.stringify(s, null, 2), { mode: 0o600 });
  return {
    SESSION_SECRET: process.env.SESSION_SECRET || s.SESSION_SECRET,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || s.ADMIN_PASSWORD_HASH,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@lab81studio.com.br",
    initialPassword: process.env.ADMIN_PASSWORD_HASH ? null : s.ADMIN_INITIAL_PASSWORD,
  };
}

const log = (...a) => console.log(new Date().toISOString(), "[boot]", ...a);
const ghHeaders = (extra = {}) => ({
  "user-agent": "lab81-boot",
  "x-github-api-version": "2022-11-28",
  ...(process.env.GH_TOKEN ? { authorization: `Bearer ${process.env.GH_TOKEN}` } : {}),
  ...extra,
});

async function latestAsset() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status} ao consultar a release "${TAG}"`);
  const rel = await res.json();
  // "uploaded" garante que o arquivo terminou de subir (o upload substitui o anterior)
  const asset = rel.assets?.find((a) => a.name === "release.tgz" && (a.state ?? "uploaded") === "uploaded");
  if (!asset) throw new Error('Release sem o arquivo "release.tgz"');
  return { id: String(asset.id), url: asset.url, label: rel.body?.split("\n")[0] ?? "" };
}

async function download(asset) {
  const dir = path.join(ROOT, asset.id);
  if (fs.existsSync(path.join(dir, "server.js"))) return dir;
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(ROOT, `${asset.id}.tgz`);
  const res = await fetch(asset.url, { headers: ghHeaders({ accept: "application/octet-stream" }), redirect: "follow" });
  if (!res.ok) throw new Error(`Download falhou: ${res.status}`);
  // Leitura completa em memória (~30 MB): evita instabilidades de streaming do cliente HTTP do Node
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024 * 1024) throw new Error(`Download incompleto (${buf.length} bytes)`);
  fs.writeFileSync(file, buf);
  try {
    execFileSync("tar", ["-xzf", file, "-C", dir]);
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw e;
  } finally {
    fs.rmSync(file, { force: true });
  }
  // mantém só as 3 versões mais recentes
  const dirs = fs
    .readdirSync(ROOT)
    .filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory())
    .sort((a, b) => fs.statSync(path.join(ROOT, b)).mtimeMs - fs.statSync(path.join(ROOT, a)).mtimeMs);
  for (const old of dirs.slice(3)) if (path.join(ROOT, old) !== dir) fs.rmSync(path.join(ROOT, old), { recursive: true, force: true });
  return dir;
}

let child = null;
let current = null; // { id, dir }
let stopping = false;

function start(dir) {
  const p = spawn(process.execPath, ["server.js"], {
    cwd: dir,
    env: {
      ...process.env,
      SESSION_SECRET: SECRETS.SESSION_SECRET,
      ADMIN_PASSWORD_HASH: SECRETS.ADMIN_PASSWORD_HASH,
      ADMIN_EMAIL: SECRETS.ADMIN_EMAIL,
      PORT: String(PORT),
      HOSTNAME: "0.0.0.0",
      NODE_ENV: "production",
    },
    stdio: "inherit",
  });
  p.on("exit", (code) => {
    if (p !== child || stopping) return;
    log(`servidor saiu (código ${code}); reiniciando em 3s`);
    setTimeout(() => {
      if (p === child && current) child = start(current.dir);
    }, 3000);
  });
  return p;
}

async function healthy(timeoutMs = 60000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

async function stop(p) {
  if (!p || p.exitCode !== null) return;
  stopping = true;
  p.kill("SIGTERM");
  await new Promise((r) => {
    const t = setTimeout(() => {
      p.kill("SIGKILL");
      r();
    }, 10000);
    p.once("exit", () => {
      clearTimeout(t);
      r();
    });
  });
  stopping = false;
}

async function revalidate() {
  const token = SECRETS.SESSION_SECRET;
  if (!token) return;
  try {
    await fetch(`http://127.0.0.1:${PORT}/api/revalidate`, { method: "POST", headers: { "x-revalidate-token": token } });
  } catch {}
}

async function activate(asset) {
  const dir = await download(asset);
  const previous = current;
  await stop(child);
  current = { id: asset.id, dir };
  child = start(dir);
  if (await healthy()) {
    log(`versão ${asset.id} no ar ${asset.label}`);
    await revalidate();
    return;
  }
  log(`versão ${asset.id} não respondeu`);
  if (previous) {
    await stop(child);
    current = previous;
    child = start(previous.dir);
    log(`revertido para ${previous.id}`);
  }
}

let SECRETS;

async function main() {
  fs.mkdirSync(ROOT, { recursive: true });
  SECRETS = ensureSecrets();
  log(`painel: /admin  ·  e-mail: ${SECRETS.ADMIN_EMAIL}`);
  if (SECRETS.initialPassword) log(`SENHA INICIAL DO PAINEL: ${SECRETS.initialPassword}`);
  for (;;) {
    try {
      await activate(await latestAsset());
      break;
    } catch (e) {
      log("primeira publicação falhou:", e.message, "— nova tentativa em 30s");
      await new Promise((r) => setTimeout(r, 30000));
    }
  }
  setInterval(async () => {
    try {
      const a = await latestAsset();
      if (a.id !== current?.id) {
        log(`nova versão encontrada: ${a.id}`);
        await activate(a);
      }
    } catch (e) {
      log("verificação de atualização falhou:", e.message);
    }
  }, INTERVAL);
}

// Um erro inesperado no supervisor não deve derrubar o site que já está no ar.
process.on("uncaughtException", (e) => {
  log("erro inesperado:", e?.stack || e);
  if (!child || child.exitCode !== null) process.exit(1); // sem site rodando: o Docker reinicia o contêiner
});
process.on("unhandledRejection", (e) => log("promessa rejeitada:", e?.stack || e));

for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, async () => {
    await stop(child);
    process.exit(0);
  });
}

main();
