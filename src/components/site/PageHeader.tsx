import { Breadcrumbs } from "./Breadcrumbs";

/** Cabeçalho editorial das páginas internas: trilha, rótulo, H1 com ponto laranja e linha de apoio. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs: { name: string; path: string }[];
  children?: React.ReactNode;
}) {
  const endsWithPunct = /[.?!]$/.test(title);
  const body = endsWithPunct ? title.slice(0, -1) : title;
  const punct = endsWithPunct ? title.slice(-1) : ".";
  return (
    <section className="relative overflow-hidden pb-14 pt-28 md:pb-20 md:pt-36">
      <div aria-hidden="true" className="absolute inset-0 bg-layers opacity-70 [mask-image:linear-gradient(to_bottom,black_10%,transparent_85%)]" />
      <div aria-hidden="true" className="absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-orange/10 blur-[120px]" />
      <div className="container-site relative">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow fade-up mt-10">{eyebrow}</p>
        <h1 className="fade-up fade-up-1 mt-5 max-w-4xl text-h1">
          {body}
          <span className="dot">{punct}</span>
        </h1>
        {lead && <p className="fade-up fade-up-2 mt-6 max-w-2xl text-lead text-titanium">{lead}</p>}
        {children && <div className="fade-up fade-up-3 mt-10">{children}</div>}
      </div>
    </section>
  );
}
