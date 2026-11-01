export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  if (!value) return "";
  // Datas do SQLite vêm como "YYYY-MM-DD HH:MM:SS" (UTC)
  const iso = value.length === 10 ? `${value}T12:00:00Z` : `${value.replace(" ", "T")}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR", { timeZone: "America/Recife", ...opts });
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTime(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
