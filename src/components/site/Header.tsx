"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NAV_ITEMS } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/servicos")
    return ["/servicos", "/impressao-3d", "/modelagem-3d", "/prototipagem-3d", "/brindes-personalizados", "/solucoes-para-empresas"].some((p) => pathname.startsWith(p));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ logo }: { logo: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao navegar (ajuste de estado durante a renderização, sem efeito)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-carbon/85 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-carbon/80 to-transparent"
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-orange focus:text-carbon focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-6 md:h-20">
        {logo}

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-3.5 py-2 text-[0.9375rem] transition-colors hover:text-offwhite ${
                      active ? "font-semibold text-offwhite" : "text-titanium"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3.5 -bottom-1 h-0.5 origin-left bg-orange transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/orcamento"
            className="btn btn-primary btn-sm hidden sm:inline-flex"
            data-track="quote_cta_click"
            data-track-location="header"
          >
            Solicitar orçamento
            <Icon name="arrow" size={18} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded text-offwhite lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} size={26} />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="menu-mobile"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-carbon bg-layers lg:hidden"
      >
        <nav aria-label="Menu móvel" className="container-site flex min-h-full flex-col pb-10 pt-6">
          <ul className="border-t border-line">
            {NAV_ITEMS.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center justify-between py-5 font-display text-2xl font-semibold"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-sans text-xs font-medium text-titanium-600">0{i + 1}</span>
                      <span className={active ? "text-orange" : "text-offwhite"}>{item.label}</span>
                    </span>
                    <Icon name="arrow" size={20} className="text-titanium" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/orcamento"
            className="btn btn-primary mt-8 w-full"
            data-track="quote_cta_click"
            data-track-location="mobile_menu"
          >
            Solicitar orçamento
            <Icon name="arrow" size={18} />
          </Link>
          <p className="mt-auto pt-10 text-xs uppercase tracking-[0.3em] text-titanium-600">Ideias ganham forma.</p>
        </nav>
      </div>
    </header>
  );
}
