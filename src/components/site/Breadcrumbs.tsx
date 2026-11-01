import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Início", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(all)} />
      <nav aria-label="Trilha de navegação" className="text-sm text-titanium-600">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => {
            const last = i === all.length - 1;
            return (
              <li key={it.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-titanium">
                    {it.name}
                  </span>
                ) : (
                  <>
                    <Link href={it.path} className="transition-colors hover:text-offwhite">
                      {it.name}
                    </Link>
                    <span aria-hidden="true" className="h-px w-3 bg-titanium-600/60" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
