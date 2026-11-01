"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ProjectTile, type PortfolioItem } from "./ProjectTile";

export function PortfolioGrid({
  items,
  categories,
  limit,
  syncUrl = false,
}: {
  items: PortfolioItem[];
  categories: { slug: string; name: string }[];
  limit?: number;
  syncUrl?: boolean;
}) {
  // Categoria vinda da URL (?categoria=...) só existe no navegador; no servidor vale "todos".
  const urlCategory = useSyncExternalStore(
    noopSubscribe,
    () => (syncUrl ? new URLSearchParams(window.location.search).get("categoria") : null),
    () => null,
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const fromUrl = urlCategory && categories.some((x) => x.slug === urlCategory) ? urlCategory : null;
  const active = chosen ?? fromUrl ?? "todos";

  function select(slug: string) {
    setChosen(slug);
    if (syncUrl) {
      const url = new URL(window.location.href);
      if (slug === "todos") url.searchParams.delete("categoria");
      else url.searchParams.set("categoria", slug);
      window.history.replaceState(null, "", url);
    }
  }

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.name])), [categories]);
  const filtered = items.filter((p) => active === "todos" || p.category === active);
  const visible = limit ? filtered.slice(0, limit) : filtered;
  const usedCats = categories.filter((c) => items.some((p) => p.category === c.slug));

  return (
    <div>
      <div role="group" aria-label="Filtrar projetos por categoria" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
        {[{ slug: "todos", name: "Todos" }, ...usedCats].map((c) => {
          const on = active === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={on}
              onClick={() => select(c.slug)}
              className={`shrink-0 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                on ? "border-orange bg-orange text-carbon" : "border-line-strong text-titanium hover:border-offwhite hover:text-offwhite"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} projeto(s) exibido(s)
      </p>

      <ul key={active} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
        {visible.map((p, i) => (
          <li
            key={p.slug}
            className="portfolio-item"
            style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
          >
            <ProjectTile item={p} categoryName={catName[p.category] ?? p.category} />
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="mt-10 text-titanium">Nenhum projeto nesta categoria por enquanto.</p>}
    </div>
  );
}

function noopSubscribe() {
  return () => {};
}
