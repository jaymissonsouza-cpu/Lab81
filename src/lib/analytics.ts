/**
 * Camada de mensuração. Os eventos vão para window.dataLayer (Google Tag Manager),
 * que só é carregado após o consentimento do visitante (LGPD).
 *
 * Eventos implementados:
 *  quote_cta_click   — clique em "Solicitar orçamento" (param: location)
 *  quote_start       — primeira interação com o formulário de orçamento
 *  quote_file_upload — arquivo anexado ao orçamento (params: kind, extension)
 *  quote_submit      — orçamento enviado e persistido (params: project_type)
 *  whatsapp_click    — clique em links de WhatsApp (param: location)
 *  project_view      — visualização de página de projeto (param: project)
 *  contact_click     — clique em e-mail, telefone ou Instagram (param: channel)
 *  contact_submit    — envio do formulário de contato
 */
export type AnalyticsEvent =
  | "quote_cta_click"
  | "quote_start"
  | "quote_file_upload"
  | "quote_submit"
  | "whatsapp_click"
  | "project_view"
  | "contact_click"
  | "contact_submit";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const CONSENT_KEY = "lab81_consent_v1";

export function track(event: AnalyticsEvent, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, params);
}
