import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Solicitação recebida", robots: { index: false, follow: false } };

const STEPS = [
  { t: "Análise", d: "Avaliamos seu projeto, arquivos e a melhor forma de fabricação." },
  { t: "Proposta", d: "Você recebe valor, prazo e recomendações pelo canal escolhido." },
  { t: "Fabricação", d: "Com a proposta aprovada, iniciamos a produção da sua peça." },
];

export default async function ConfirmacaoPage({ searchParams }: { searchParams: Promise<{ protocolo?: string }> }) {
  const { protocolo } = await searchParams;
  const protocol = protocolo && /^L81-\d{6}-[A-Z0-9]{5}$/.test(protocolo) ? protocolo : null;

  return (
    <section className="relative overflow-hidden pb-10 pt-32 md:pt-40">
      <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-site relative max-w-3xl">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange text-carbon">
          <Icon name="check" size={28} />
        </span>
        <h1 className="mt-8 text-h1">
          Solicitação recebida<span className="dot">.</span>
        </h1>
        {protocol ? (
          <>
            <p className="mt-6 text-lead text-titanium">Guarde o número do seu protocolo. Ele identifica sua solicitação em qualquer contato com a LAB81.</p>
            <div className="mt-8 inline-flex flex-col rounded-lg border border-line-strong bg-carbon-800 px-6 py-5">
              <span className="text-xs uppercase tracking-[0.25em] text-titanium-600">Protocolo</span>
              <span className="mt-1 select-all font-display text-3xl font-bold tracking-wide text-offwhite">{protocol}</span>
            </div>
          </>
        ) : (
          <p className="mt-6 text-lead text-titanium">Se você acabou de enviar um orçamento, o protocolo foi exibido nesta página logo após o envio.</p>
        )}

        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="bg-carbon p-6">
              <span className="font-display text-sm text-titanium-600">0{i + 1}</span>
              <p className="mt-3 font-display text-lg font-semibold">{s.t}</p>
              <p className="mt-1 text-sm text-titanium">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/projetos" className="btn btn-outline">
            Explorar projetos <Icon name="arrow" size={18} />
          </Link>
          <Link href="/" className="btn btn-outline">
            Voltar ao início
          </Link>
        </div>
      </div>
    </section>
  );
}
