import "server-only";
import { Marked } from "marked";
import { slugify } from "./format";

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Markdown → HTML para o blog. HTML bruto é escapado (não executado), links externos
 * recebem rel="noopener" e só são aceitos esquemas http(s), mailto, tel e caminhos relativos.
 */
const md = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = slugify(text.replace(/<[^>]+>/g, ""));
      const level = Math.min(Math.max(depth, 2), 4);
      return `<h${level} id="${id}">${text}</h${level}>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : "#";
      const external = /^https?:/i.test(safe);
      const t = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(safe)}"${t}${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
    },
    image({ href, title, text }) {
      const safe = /^(https?:|\/)/i.test(href) ? href : "";
      if (!safe) return "";
      const t = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(safe)}" alt="${escapeHtml(text)}"${t} loading="lazy" decoding="async" />`;
    },
  },
});

export function renderMarkdown(source: string) {
  return md.parse(source, { async: false }) as string;
}

export function extractHeadings(source: string) {
  return source
    .split("\n")
    .filter((l) => /^##\s+/.test(l))
    .map((l) => l.replace(/^##\s+/, "").trim())
    .map((t) => ({ text: t, id: slugify(t) }));
}
