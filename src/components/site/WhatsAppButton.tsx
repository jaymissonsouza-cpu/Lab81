import { getSettings } from "@/lib/repos";
import { whatsappUrl } from "@/lib/contact";
import { Icon } from "@/components/ui/Icon";

/** Botão flutuante de WhatsApp. Só aparece quando o número estiver configurado no painel. */
export function WhatsAppButton() {
  const url = whatsappUrl(getSettings().whatsapp, "Olá! Vim pelo site da LAB81 e gostaria de falar sobre um projeto.");
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      aria-label="Conversar no WhatsApp"
      data-track="whatsapp_click"
      data-track-location="floating"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-carbon-700/90 text-offwhite shadow-2xl shadow-black/40 backdrop-blur transition-colors hover:border-orange hover:text-orange"
    >
      <Icon name="whatsapp" size={26} />
    </a>
  );
}
