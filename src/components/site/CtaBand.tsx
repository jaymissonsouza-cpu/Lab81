import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function CtaBand({
  title = "Sua próxima ideia merece ganhar forma.",
  text = "Conte o que você quer criar. Analisamos seu projeto e enviamos uma proposta personalizada.",
  button = "Começar meu projeto",
  href = "/orcamento",
  location = "cta_band",
}: {
  title?: string;
  text?: string;
  button?: string;
  href?: string;
  location?: string;
}) {
  return (
    <section className="container-site mt-24 md:mt-32" aria-labelledby={`cta-${location}`}>
      <div className="relative overflow-hidden rounded-xl border border-line bg-carbon-800">
        <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-80" />
        <svg aria-hidden="true" className="absolute -right-24 -top-24 h-[34rem] w-[34rem] text-orange/25" viewBox="0 0 400 400" fill="none">
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx="200" cy="200" r={40 + i * 12} stroke="currentColor" strokeWidth="1" opacity={1 - i * 0.06} />
          ))}
        </svg>
        <div className="relative grid gap-8 px-6 py-14 md:grid-cols-[1fr_auto] md:items-end md:px-14 md:py-20">
          <div className="reveal max-w-2xl">
            <span aria-hidden="true" className="block h-0.5 w-12 bg-orange" />
            <h2 id={`cta-${location}`} className="mt-6 text-h2">
              {title.replace(/\.$/, "")}
              <span className="dot">.</span>
            </h2>
            <p className="mt-5 text-lead text-titanium">{text}</p>
          </div>
          <Link href={href} className="btn btn-primary w-full md:w-auto" data-track="quote_cta_click" data-track-location={location}>
            {button}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
