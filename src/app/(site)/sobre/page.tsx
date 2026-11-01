import Image from "next/image";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/sobre",
    title: "Sobre a LAB81 Studio",
    description:
      "A LAB81 Studio é um estúdio de design e fabricação digital em Recife. Conheça o conceito por trás do nome e a forma como trabalhamos.",
  });
}

const NAME_PARTS = [
  { k: "LAB", t: "Laboratório criativo", d: "Um espaço de experimentação, onde ideias são testadas, ajustadas e testadas de novo até funcionarem." },
  { k: "81", t: "Raízes em Pernambuco", d: "O DDD de Recife e de parte de Pernambuco. Um estúdio daqui, feito para quem cria daqui e de outros lugares." },
  { k: "Studio", t: "Design em primeiro lugar", d: "Mais do que imprimir arquivos: pensamos forma, função e acabamento de cada objeto." },
];

const PRINCIPLES = [
  { t: "Camada por camada", d: "A impressão 3D constrói objetos adicionando uma camada sobre a outra. Trabalhamos do mesmo jeito: cada etapa do projeto apoia a próxima." },
  { t: "Transparência", d: "Antes de fabricar, você sabe o que será feito, com qual material, em quanto tempo e por qual valor." },
  { t: "Técnica a serviço da ideia", d: "Escolhemos materiais e parâmetros pelo uso real da peça, e explicamos o porquê de cada escolha." },
  { t: "Honestidade sobre limites", d: "Se a impressão 3D não for o melhor caminho para o seu projeto, dizemos isso." },
];

export default function SobrePage() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre"
        title="Um estúdio de fabricação digital em Recife."
        lead="A LAB81 transforma ideias em objetos físicos por meio de criatividade, tecnologia e precisão. Desenvolvemos e fabricamos peças únicas, protótipos e produtos autorais com impressão 3D."
        crumbs={[{ name: "Sobre", path: "/sobre" }]}
      />

      <section className="container-site" aria-labelledby="nome">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="reveal relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-line bg-carbon-900 lg:col-span-5">
            <div aria-hidden="true" className="absolute inset-0 bg-layers" />
            <Image src="/brand/lab81-logo-completo.png" alt="Logotipo LAB81, com a letra B integrada ao número 8" width={878} height={760} className="relative w-1/2" sizes="(min-width:1024px) 20vw, 50vw" />
          </div>
          <div className="lg:col-span-7">
            <h2 id="nome" className="text-h2">
              O que significa LAB81<span className="dot">?</span>
            </h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {NAME_PARTS.map((p) => (
                <li key={p.k} className="reveal grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
                  <span className="font-display text-3xl font-bold text-orange">{p.k}</span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{p.t}</span>
                    <span className="mt-1 block text-titanium">{p.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-titanium">
              No logotipo, a letra B e o número 8 se fundem em um único traço: a mesma ideia de transformar uma coisa em outra que
              guia o trabalho do estúdio.
            </p>
          </div>
        </div>
      </section>

      <section className="container-site mt-24 md:mt-32" aria-labelledby="como">
        <h2 id="como" className="text-h2">
          Como trabalhamos<span className="dot">.</span>
        </h2>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <li key={p.t} className="reveal bg-carbon p-8">
              <span className="font-display text-sm text-titanium-600">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-titanium">{p.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand location="sobre_final" />
    </>
  );
}
