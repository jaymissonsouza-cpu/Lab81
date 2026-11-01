import Link from "next/link";
import type { Metadata } from "next";
import { SiteChrome } from "@/components/site/SiteChrome";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Página não encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative overflow-hidden pb-20 pt-36 md:pt-44">
        <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-site relative">
          <p className="eyebrow">Erro 404</p>
          <h1 className="mt-6 max-w-3xl text-h1">
            Esta peça ainda não foi impressa<span className="dot">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lead text-titanium">
            A página que você procura não existe ou mudou de endereço. Que tal voltar ao início ou conhecer nossos projetos?
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              Voltar ao início <Icon name="arrow" size={18} />
            </Link>
            <Link href="/projetos" className="btn btn-outline">
              Ver projetos <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
