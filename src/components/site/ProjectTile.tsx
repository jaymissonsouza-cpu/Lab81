import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DemoBadge } from "@/components/ui/DemoBadge";

export type PortfolioItem = {
  slug: string;
  title: string;
  category: string;
  material: string;
  is_demo: boolean;
  cover: { src: string; alt: string } | null;
};

/** Card de projeto (usado na home, no portfólio e em "projetos relacionados"). */
export function ProjectTile({ item, categoryName, priority = false }: { item: PortfolioItem; categoryName: string; priority?: boolean }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-line bg-carbon-800 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-line-strong">
      <div className="relative aspect-[4/3] overflow-hidden bg-carbon-900">
        {item.cover && (
          <Image
            src={item.cover.src}
            alt={item.cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-carbon-800/70 via-transparent to-transparent" />
        {item.is_demo && <DemoBadge className="absolute left-3 top-3" />}
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-line p-5">
        <div className="border-l-2 border-orange pl-3">
          <p className="text-xs uppercase tracking-[0.18em] text-titanium-600">
            {categoryName}
            {item.material ? ` · ${item.material}` : ""}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug">
            <Link href={`/projetos/${item.slug}`} className="after:absolute after:inset-0">
              {item.title}
            </Link>
          </h3>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-300 group-hover:border-orange group-hover:bg-orange group-hover:text-carbon"
        >
          <Icon name="arrow" size={18} />
        </span>
      </div>
    </article>
  );
}

export function toPortfolioItem(p: {
  slug: string;
  title: string;
  category: string;
  material: string;
  is_demo: boolean;
  images: { src: string; alt: string }[];
}): PortfolioItem {
  return { slug: p.slug, title: p.title, category: p.category, material: p.material, is_demo: p.is_demo, cover: p.images[0] ?? null };
}
