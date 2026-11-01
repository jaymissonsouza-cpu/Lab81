#!/usr/bin/env node
// Operações no VPS e no domínio da Hostinger pela API oficial (https://developers.hostinger.com).
// Autenticação: variável HOSTINGER_API_TOKEN, ou injeção do token pelo proxy do ambiente.
//
// Uso:
//   node scripts/hostinger.mjs status                       VPS, domínio e projetos Docker
//   node scripts/hostinger.mjs deploy                       cria/atualiza o projeto "lab81" no VPS
//   node scripts/hostinger.mjs dns                          aponta o domínio (@ e www) para o IP do VPS
//   node scripts/hostinger.mjs https                        ativa HTTPS (Caddy) para o domínio
//   node scripts/hostinger.mjs logs [app|caddy]             últimos logs do contêiner
//   node scripts/hostinger.mjs restart                      reinicia o projeto (força buscar a última versão)
// Opções (env): VPS_ID, DOMAIN (padrão lab81studio.com.br), ADMIN_EMAIL, ADMIN_PASSWORD (só no 1º deploy)

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const API = "https://developers.hostinger.com";
const DOMAIN = process.env.DOMAIN || "lab81studio.com.br";
const PROJECT = "lab81";
const TOKEN = process.env.HOSTINGER_API_TOKEN;

async function api(method, p, body) {
  const res = await fetch(API + p, {
    method,
    headers: {
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {}),
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${p} → ${res.status}: ${typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 500)}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function vm() {
  const list = await api("GET", "/api/vps/v1/virtual-machines");
  if (!list?.length) throw new Error("Nenhum VPS encontrado nesta conta.");
  const chosen = process.env.VPS_ID ? list.find((v) => String(v.id) === process.env.VPS_ID) : list[0];
  if (!chosen) throw new Error(`VPS ${process.env.VPS_ID} não encontrado.`);
  const ip = chosen.ipv4?.[0]?.address ?? chosen.ipv4?.address;
  return { ...chosen, ip, all: list };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const [N, r, p] = [16384, 8, 1];
  const hash = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

const parseEnv = (s) => Object.fromEntries((s || "").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const toEnv = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${v}`).join("\n");

async function currentProject(id) {
  try {
    return await api("GET", `/api/vps/v1/virtual-machines/${id}/docker/${PROJECT}`);
  } catch (e) {
    if (e.status === 404 || e.status === 422) return null;
    throw e;
  }
}

const commands = {
  async status() {
    const v = await vm();
    console.log("VPS:", v.all.map((x) => `${x.id} ${x.hostname} ${x.plan} ${x.state} ip=${x.ipv4?.[0]?.address ?? "?"} template=${x.template?.name ?? "?"}`).join("\n     "));
    try {
      const d = await api("GET", `/api/domains/v1/portfolio/${DOMAIN}`);
      console.log(`Domínio ${DOMAIN}: ${d.status}${d.message ? ` (${d.message})` : ""}`);
    } catch (e) {
      console.log(`Domínio ${DOMAIN}: não encontrado nesta conta (${e.status})`);
    }
    try {
      const projects = await api("GET", `/api/vps/v1/virtual-machines/${v.id}/docker`);
      console.log("Projetos Docker:", JSON.stringify(projects, null, 1).slice(0, 1500));
    } catch (e) {
      console.log("Docker Manager:", e.message);
    }
  },

  async deploy() {
    const v = await vm();
    const compose = fs.readFileSync(path.join(import.meta.dirname, "..", "deploy", "docker-compose.yaml"), "utf8");
    const existing = await currentProject(v.id);
    const env = parseEnv(existing?.environment);
    if (!env.SESSION_SECRET) env.SESSION_SECRET = crypto.randomBytes(32).toString("hex");
    if (process.env.ADMIN_EMAIL) env.ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (process.env.ADMIN_PASSWORD) env.ADMIN_PASSWORD_HASH = hashPassword(process.env.ADMIN_PASSWORD);
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) throw new Error("No primeiro deploy, informe ADMIN_EMAIL e ADMIN_PASSWORD.");
    env.SITE_ADDRESS ||= ":80";
    env.SITE_URL ||= `http://${v.ip}`;
    const r = await api("POST", `/api/vps/v1/virtual-machines/${v.id}/docker`, { project_name: PROJECT, content: compose, environment: toEnv(env) });
    console.log("Projeto enviado:", JSON.stringify(r).slice(0, 400));
    console.log(`Acesse: http://${v.ip}`);
  },

  async dns() {
    const v = await vm();
    const r = await api("PUT", `/api/dns/v1/zones/${DOMAIN}`, {
      overwrite: true,
      zone: [
        { name: "@", type: "A", ttl: 300, records: [{ content: v.ip }] },
        { name: "www", type: "A", ttl: 300, records: [{ content: v.ip }] },
      ],
    });
    console.log("DNS:", JSON.stringify(r));
  },

  async https() {
    const v = await vm();
    const existing = await currentProject(v.id);
    if (!existing) throw new Error("Projeto ainda não existe: rode deploy primeiro.");
    const env = parseEnv(existing.environment);
    env.SITE_ADDRESS = `${DOMAIN}, www.${DOMAIN}`;
    env.SITE_URL = `https://${DOMAIN}`;
    const r = await api("POST", `/api/vps/v1/virtual-machines/${v.id}/docker`, { project_name: PROJECT, content: existing.content, environment: toEnv(env) });
    console.log("HTTPS configurado:", JSON.stringify(r).slice(0, 300));
  },

  async logs(service = "app") {
    const v = await vm();
    const r = await api("GET", `/api/vps/v1/virtual-machines/${v.id}/docker/${PROJECT}/logs`);
    const text = JSON.stringify(r);
    console.log(text.length > 6000 ? text.slice(-6000) : text, `\n(serviço pedido: ${service})`);
  },

  async restart() {
    const v = await vm();
    console.log(JSON.stringify(await api("POST", `/api/vps/v1/virtual-machines/${v.id}/docker/${PROJECT}/restart`)));
  },
};

const [cmd = "status", ...args] = process.argv.slice(2);
if (!commands[cmd]) {
  console.error(`Comando desconhecido: ${cmd}. Use: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}
commands[cmd](...args).catch((e) => {
  console.error("Erro:", e.message);
  process.exit(1);
});
