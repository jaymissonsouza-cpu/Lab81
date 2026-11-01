"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CONSENT_KEY, track, type AnalyticsEvent } from "@/lib/analytics";

type Consent = "granted" | "denied" | null;

const listeners = new Set<() => void>();
function subscribeConsent(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Fallback em memória quando o armazenamento do navegador está bloqueado
let memoryConsent: Consent = null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : memoryConsent;
  } catch {
    return memoryConsent;
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // O GTM espera o objeto "arguments" no formato do gtag.js
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
  void args;
}

function loadGtm(id: string) {
  if (document.getElementById("gtm-script")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/**
 * Banner de consentimento + carregamento do GTM (Consent Mode v2) + rastreamento por atributos.
 * Qualquer elemento com data-track="evento" dispara o evento ao ser clicado;
 * atributos data-track-* viram parâmetros (ex.: data-track-location="hero").
 */
export function Analytics({ gtmId }: { gtmId?: string }) {
  // No servidor assumimos "decidido" para não renderizar o banner; no navegador lemos o localStorage.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "granted" as Consent);
  const [reopened, setReopened] = useState(false);
  const open = reopened || consent === null;

  useEffect(() => {
    // Origem da visita (usada no orçamento para saber de onde vêm os pedidos). Fica apenas nesta aba.
    try {
      if (!sessionStorage.getItem("lab81_landing")) {
        sessionStorage.setItem("lab81_landing", location.pathname + location.search);
        if (document.referrer && !document.referrer.startsWith(location.origin)) sessionStorage.setItem("lab81_referrer", document.referrer);
        const params = new URLSearchParams(location.search);
        for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) {
          const v = params.get(k);
          if (v) sessionStorage.setItem(`lab81_${k}`, v);
        }
      }
    } catch {
      /* armazenamento indisponível */
    }

    const c = readConsent();

    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: c === "granted" ? "granted" : "denied",
    });
    if (c === "granted" && gtmId) loadGtm(gtmId);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track],[data-open-consent]");
      if (!el) return;
      if (el.hasAttribute("data-open-consent")) {
        setReopened(true);
        return;
      }
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(el.dataset)) {
        if (k.startsWith("track") && k !== "track" && v) params[k.slice(5).toLowerCase()] = v;
      }
      track(el.dataset.track as AnalyticsEvent, params);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [gtmId]);

  function decide(value: "granted" | "denied") {
    memoryConsent = value;
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* navegação privada: decisão vale só para esta sessão */
    }
    listeners.forEach((l) => l());
    setReopened(false);
    gtag("consent", "update", { analytics_storage: value });
    if (value === "granted" && gtmId) loadGtm(gtmId);
  }

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-lg border border-line-strong bg-carbon-800/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:inset-x-5 sm:bottom-5 md:p-6"
    >
      <h2 id="consent-title" className="font-display text-lg">
        Sua privacidade
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-titanium">
        Usamos cookies de mensuração para entender como o site é usado e melhorar sua experiência. Eles só são ativados com a
        sua permissão. Saiba mais na{" "}
        <Link href="/politica-de-privacidade" className="underline decoration-orange underline-offset-4">
          política de privacidade
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => decide("granted")}>
          Aceitar
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => decide("denied")}>
          Recusar
        </button>
      </div>
      {consent && <p className="mt-3 text-xs text-titanium-600">Escolha atual: {consent === "granted" ? "aceito" : "recusado"}.</p>}
    </div>
  );
}
