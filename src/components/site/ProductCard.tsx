import Image from "next/image";
import Link from "next/link";
import { AVAILABILITY_LABEL, type Product } from "@/lib/repos";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product, categoryName }: { product: Product; categoryName: string }) {
  const cover = product.images[0];
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-carbon-800 transition-colors duration-300 hover:border-line-strong">
      <div className="relative aspect-square overflow-hidden bg-carbon-900">
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        {product.is_demo && <DemoBadge className="absolute left-3 top-3" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-titanium-600">{categoryName}</p>
        <h3 className="mt-1.5 font-display text-lg font-semibold">
          <Link href={`/produtos/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-titanium">{product.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="text-titanium-600">{AVAILABILITY_LABEL[product.availability] ?? "Sob consulta"}</span>
          {product.show_price && product.price_cents != null ? (
            <span className="font-semibold text-offwhite">{formatPrice(product.price_cents)}</span>
          ) : (
            <span className="text-orange">Solicitar</span>
          )}
        </div>
      </div>
    </article>
  );
}
