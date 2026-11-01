"use client";

import { startTransition, useActionState, useEffect } from "react";
import Link from "next/link";
import { sendContactMessage, type ContactState } from "./actions";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, null);
  const err = state?.errors ?? {};

  useEffect(() => {
    if (state?.ok) track("contact_submit");
  }, [state]);

  if (state?.ok) {
    return (
      <div role="status" className="panel p-8">
        <Icon name="check" size={32} className="text-orange" />
        <p className="mt-4 font-display text-2xl font-semibold">{state.message}</p>
        <p className="mt-2 text-titanium">Se o assunto for um projeto, você também pode enviar os detalhes pelo formulário de orçamento.</p>
        <Link href="/orcamento" className="btn btn-outline mt-6">
          Ir para orçamento <Icon name="arrow" size={18} />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="panel relative space-y-5 p-6 md:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">Nome</label>
          <input id="c-name" name="name" className="field" autoComplete="name" required aria-invalid={!!err.name} aria-describedby={err.name ? "c-name-e" : undefined} />
          {err.name && <p id="c-name-e" className="mt-1.5 text-sm text-red-400">{err.name}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">E-mail</label>
          <input id="c-email" name="email" type="email" className="field" autoComplete="email" inputMode="email" required aria-invalid={!!err.email} aria-describedby={err.email ? "c-email-e" : undefined} />
          {err.email && <p id="c-email-e" className="mt-1.5 text-sm text-red-400">{err.email}</p>}
        </div>
        <div>
          <label htmlFor="c-phone" className="field-label">
            Telefone / WhatsApp <span className="text-titanium-600">(opcional)</span>
          </label>
          <input id="c-phone" name="phone" type="tel" className="field" autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label htmlFor="c-subject" className="field-label">
            Assunto <span className="text-titanium-600">(opcional)</span>
          </label>
          <input id="c-subject" name="subject" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="field-label">Mensagem</label>
        <textarea id="c-message" name="message" className="field" rows={5} required aria-invalid={!!err.message} aria-describedby={err.message ? "c-message-e" : undefined} />
        {err.message && <p id="c-message-e" className="mt-1.5 text-sm text-red-400">{err.message}</p>}
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha este campo <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm text-titanium">
        <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-orange" aria-invalid={!!err.consent} />
        <span>
          Concordo com o uso dos meus dados para receber uma resposta, conforme a{" "}
          <Link href="/politica-de-privacidade" className="text-offwhite underline decoration-orange underline-offset-4">política de privacidade</Link>.
        </span>
      </label>
      {err.consent && <p className="text-sm text-red-400">{err.consent}</p>}
      {state && !state.ok && (
        <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensagem"} <Icon name="arrow" size={18} />
      </button>
    </form>
  );
}
