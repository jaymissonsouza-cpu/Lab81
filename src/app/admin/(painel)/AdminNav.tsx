"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/orcamentos", label: "Orçamentos" },
  { href: "/admin/mensagens", label: "Mensagens" },
  { href: "/admin/calculadora", label: "Calculadora de custos" },
  { href: "/admin/projetos", label: "Projetos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/seo", label: "SEO das páginas" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav aria-label="Painel" className="overflow-x-auto">
      <ul className="flex gap-1 px-3 pb-3 lg:flex-col lg:px-3">
        {ITEMS.map((it) => {
          const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-3 whitespace-nowrap rounded px-3 py-2 text-sm ${
                  active ? "bg-carbon-700 text-offwhite" : "text-titanium hover:bg-carbon-800 hover:text-offwhite"
                }`}
              >
                {it.label}
                {badges[it.href] ? <span className="rounded-full bg-orange px-1.5 text-xs font-semibold text-carbon">{badges[it.href]}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
