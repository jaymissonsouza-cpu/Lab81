import Image from "next/image";
import Link from "next/link";

/**
 * Logotipo LAB81 Studio.
 * PROVISÓRIO: usa recortes PNG da referência fornecida (public/brand/lab81-simbolo.png e lab81-wordmark.png).
 * Ao receber o SVG oficial, salve em public/brand/ e troque os `src` abaixo — este é o único ponto de uso.
 */
export const LOGO_ASSETS = {
  symbol: { src: "/brand/lab81-simbolo.png", width: 863, height: 488 },
  wordmark: { src: "/brand/lab81-wordmark.png", width: 878, height: 214 },
};

export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="LAB81 Studio — página inicial">
      <Image
        src={LOGO_ASSETS.symbol.src}
        width={LOGO_ASSETS.symbol.width}
        height={LOGO_ASSETS.symbol.height}
        alt=""
        priority
        className="h-7 w-auto md:h-8"
        sizes="64px"
      />
      {!compact && (
        <span className="flex items-baseline gap-1.5">
          <Image
            src={LOGO_ASSETS.wordmark.src}
            width={LOGO_ASSETS.wordmark.width}
            height={LOGO_ASSETS.wordmark.height}
            alt=""
            priority
            className="h-[1.15rem] w-auto md:h-[1.3rem]"
            sizes="120px"
          />
          <span className="font-display text-[1.05rem] font-normal tracking-[0.02em] text-offwhite md:text-[1.2rem]">STUDIO</span>
        </span>
      )}
    </Link>
  );
}
