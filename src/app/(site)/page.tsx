import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { PortfolioGrid } from "@/components/site/PortfolioGrid";
import { ProjectTile, toPortfolioItem } from "@/components/site/ProjectTile";
import { SERVICE_CARDS, MATERIALS_INFO } from "@/content/services";
import { listCategories, listPosts, listProjects } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata({
    path: "/",
    title: "LAB81 Studio | Impressão 3D em Recife — Da ideia ao objeto",
    description:
      "Estúdio de design e fabricação digital em Recife. Impressão 3D personalizada, modelagem 3D, prototipagem e produtos autorais em PLA, PETG, ABS e ASA. Solicite seu orçamento.",
  });
}

const PROCESS: { n: string; icon: IconName; title: string; text: string }[] = [
  {
    n: "01",
    icon: "bulb",
    title: "Compartilhe sua ideia",
    text: "Envie seu arquivo 3D, fotos, esboço ou apenas a descrição do que precisa. Analisamos e orientamos a melhor solução.",
  },
  {
    n: "02",
    icon: "cube",
    title: "Desenvolvemos a solução",
    text: "Modelagem 3D, ajustes técnicos e escolha do material. Você valida o projeto e a proposta antes de fabricarmos.",
  },
  {
    n: "03",
    icon: "layers",
    title: "Fabricamos sua peça",
    text: "Impressão 3D camada por camada, com parâmetros definidos para o uso real da peça.",
  },
  {
    n: "04",
    icon: "truck",
    title: "Acabamento e entrega",
    text: "Realizamos os acabamentos combinados e alinhamos com você a melhor forma de entrega ou retirada.",
  },
];

const DIFFERENTIALS: { icon: IconName; title: string; text: string }[] = [
  { icon: "chat", title: "Atendimento personalizado", text: "Você conversa com quem projeta e fabrica a sua peça, do primeiro contato à entrega." },
  { icon: "layers", title: "Orientação sobre materiais", text: "Indicamos o filamento certo para cada uso: decoração, encaixe, calor ou uso externo." },
  { icon: "cube", title: "Design e fabricação sob demanda", text: "Modelagem e impressão no mesmo estúdio, sem molde e sem quantidade mínima." },
  { icon: "gear", title: "Soluções para diferentes aplicações", text: "Peças decorativas, técnicas, protótipos e produtos personalizados." },
  { icon: "pin", title: "Recife e outras regiões", text: "Atendimento em Recife e Região Metropolitana e envio para outras regiões conforme capacidade operacional." },
];

export default function HomePage() {
  const projects = listProjects({ publishedOnly: true });
  const categories = listCategories("project");
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const items = projects.map(toPortfolioItem);
  const featured = items.filter((_, i) => projects[i].featured).slice(0, 3);
  const heroDemo = true; // imagem do hero é demonstrativa até receber fotografia oficial
  const posts = listPosts({ publishedOnly: true }).slice(0, 3);

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative isolate overflow-hidden pt-16 md:pt-20" aria-labelledby="hero-title">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-carbon" />
        {/* Contornos paramétricos */}
        <svg aria-hidden="true" className="absolute -left-40 top-24 -z-10 h-[46rem] w-[46rem] text-orange/20 md:left-[18%]" viewBox="0 0 600 600" fill="none">
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse key={i} cx="300" cy="300" rx={60 + i * 15} ry={40 + i * 13} stroke="currentColor" strokeWidth="0.8" opacity={1 - i * 0.05} transform={`rotate(${-18 + i * 1.5} 300 300)`} />
          ))}
        </svg>

        <div className="container-site relative grid items-center gap-8 pb-12 pt-2 md:pt-10 lg:min-h-[min(40rem,calc(100svh-14rem))] lg:grid-cols-12 lg:gap-6 lg:pb-14 lg:pt-4">
          <div className="relative z-10 order-2 lg:order-none lg:col-span-6">
            <p className="eyebrow fade-up">Design + impressão 3D em Recife</p>
            <h1 id="hero-title" className="fade-up fade-up-1 mt-6 text-display">
              Da ideia
              <br />
              ao objeto<span className="dot">.</span>
            </h1>
            <p className="fade-up fade-up-2 mt-7 max-w-xl text-lead text-offwhite/90">
              Criamos, desenvolvemos e fabricamos peças únicas com design, tecnologia e impressão 3D de precisão.
            </p>
            <p className="fade-up fade-up-2 mt-3 max-w-xl text-titanium">
              Impressão 3D personalizada, prototipagem e soluções criativas em Recife.
            </p>
            <div className="fade-up fade-up-3 mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/orcamento" className="btn btn-primary" data-track="quote_cta_click" data-track-location="hero">
                Solicitar orçamento <Icon name="arrow" size={18} />
              </Link>
              <Link href="/projetos" className="btn btn-outline">
                Explorar projetos <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>

          <div className="relative order-1 -mx-5 md:mx-0 lg:order-none lg:col-span-6 lg:-mr-10 xl:-mr-24">
            <div className="build-up relative aspect-[4/3] overflow-hidden sm:aspect-[700/444] md:rounded-lg lg:rounded-none">
              <Image
                src="/demo/luminaria-parametrica-laranja.webp"
                alt="Luminária paramétrica laranja impressa em 3D, iluminada por dentro, sobre uma base de pedra escura"
                fill
                priority
                fetchPriority="high"
                quality={90}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-carbon via-transparent to-transparent lg:via-carbon/0" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-carbon/40" />
              {heroDemo && <DemoBadge className="absolute bottom-3 left-5 md:left-3 lg:left-auto lg:right-56 xl:right-64" />}
            </div>

            <aside aria-label="O que fazemos" className="absolute -right-4 top-6 hidden w-44 min-[1600px]:block">
              <span aria-hidden="true" className="block h-0.5 w-8 bg-orange" />
              <p className="mt-4 font-sans text-xs uppercase leading-6 tracking-[0.35em] text-offwhite">Ideias ganham forma aqui.</p>
              <ul className="mt-6 space-y-1.5 text-[0.6875rem] uppercase tracking-[0.25em] text-titanium">
                <li>Prototipagem</li>
                <li>Peças funcionais</li>
                <li>Decoração</li>
                <li>Produtos sob medida</li>
              </ul>
            </aside>
          </div>
        </div>

        {/* Projetos em destaque (faixa do mockup) */}
        {featured.length > 0 && (
          <div className="container-site relative pb-6">
            <h2 className="sr-only">Projetos em destaque</h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {featured.map((p) => (
                <li key={p.slug}>
                  <ProjectTile item={p} categoryName={catName[p.category] ?? p.category} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ───────────── SERVIÇOS ───────────── */}
      <section className="container-site mt-24 md:mt-36" aria-labelledby="servicos-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                id="servicos-title"
                eyebrow="Serviços"
                title="Da primeira ideia à peça final."
                lead="Do desenho ao objeto pronto, cuidamos de cada etapa. Você pode chegar com um arquivo, um esboço ou só uma necessidade."
              />
              <Link href="/servicos" className="btn btn-outline mt-8">
                Todos os serviços <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
          <ol className="border-t border-line lg:col-span-7">
            {SERVICE_CARDS.map((s, i) => (
              <li key={s.href} className="reveal border-b border-line">
                <Link href={s.href} className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 py-7 md:gap-8 md:py-9">
                  <span className="pt-1 font-display text-sm font-medium text-titanium-600">0{i + 1}</span>
                  <span>
                    <span className="flex items-center gap-3">
                      <Icon name={s.icon} size={22} className="text-orange" />
                      <span className="font-display text-h3 font-semibold transition-colors group-hover:text-orange">{s.title}</span>
                    </span>
                    <span className="mt-3 block max-w-lg text-titanium">{s.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-orange group-hover:bg-orange group-hover:text-carbon"
                  >
                    <Icon name="arrow" size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── PORTFÓLIO ───────────── */}
      <section className="container-site mt-24 md:mt-36" aria-labelledby="portfolio-title">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            id="portfolio-title"
            eyebrow="Portfólio"
            title="Projetos que ganham forma."
            lead="Ideias transformadas em objetos com design, tecnologia e precisão."
          />
          <Link href="/projetos" className="btn btn-outline shrink-0">
            Ver todos os projetos <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="mt-10">
          <PortfolioGrid items={items} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} limit={6} />
        </div>
      </section>

      {/* ───────────── PROCESSO ───────────── */}
      <section className="relative mt-24 border-y border-line bg-carbon-900 py-20 md:mt-36 md:py-28" aria-labelledby="processo-title">
        <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-50" />
        <div className="container-site relative">
          <SectionHeading id="processo-title" eyebrow="Nosso processo" title="Simples, transparente e eficiente." />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
            {PROCESS.map((step) => (
              <li key={step.n} className="reveal relative bg-carbon-900 p-7 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="font-display text-4xl font-bold text-offwhite">{step.n}</span>
                  <span aria-hidden="true" className="h-9 w-0.5 bg-orange" />
                  <Icon name={step.icon} size={30} className="text-offwhite" strokeWidth={1.25} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-titanium">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── DIFERENCIAIS ───────────── */}
      <section className="container-site mt-24 md:mt-36" aria-labelledby="diferenciais-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="diferenciais-title"
              eyebrow="Por que a LAB81"
              title="Um estúdio, não uma fila de impressão."
              lead="Cada projeto é tratado como único: entendemos o uso, propomos a solução e fabricamos com cuidado."
            />
            <div className="reveal mt-10">
              <p className="text-xs uppercase tracking-[0.25em] text-titanium-600">Materiais</p>
              <ul className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
                {MATERIALS_INFO.map((m) => (
                  <li key={m.name} className="bg-carbon p-4">
                    <p className="font-display text-lg font-semibold">{m.name}</p>
                    <p className="mt-1 text-sm text-titanium">{m.text.split(".")[0]}.</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {DIFFERENTIALS.map((d, i) => (
              <li key={d.title} className={`reveal panel p-6 md:p-7 ${i === DIFFERENTIALS.length - 1 ? "sm:col-span-2" : ""}`}>
                <Icon name={d.icon} size={26} className="text-orange" />
                <h3 className="mt-5 font-display text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-titanium">{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── BLOG ───────────── */}
      {posts.length > 0 && (
        <section className="container-site mt-24 md:mt-36" aria-labelledby="blog-title">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading id="blog-title" eyebrow="Conteúdo" title="Guia de impressão 3D." lead="Respostas diretas para quem está começando um projeto." />
            <Link href="/blog" className="btn btn-outline shrink-0">
              Ver todos os artigos <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="reveal group relative bg-carbon p-7 transition-colors hover:bg-carbon-800">
                <p className="text-xs uppercase tracking-[0.2em] text-titanium-600">{formatDate(p.published_at)}</p>
                <h3 className="mt-4 font-display text-xl font-semibold leading-snug">
                  <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-titanium">{p.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-orange">
                  Ler artigo <Icon name="arrow" size={16} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand location="home_final" />
    </>
  );
}
