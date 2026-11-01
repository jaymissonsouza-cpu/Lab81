/** Normaliza um número brasileiro para o formato do wa.me (somente dígitos, com DDI 55). */
export function whatsappUrl(number: string, text?: string) {
  let digits = number.replace(/\D/g, "");
  if (!digits) return null;
  if (!digits.startsWith("55")) digits = `55${digits}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export function instagramUrl(handle: string) {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

export function telUrl(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d ? `tel:+${d.startsWith("55") ? d : `55${d}`}` : null;
}
