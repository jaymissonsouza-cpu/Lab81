"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/admin/actions";

/** Formulário do painel com feedback de sucesso/erro. */
export function AdminForm({
  action,
  children,
  submitLabel = "Salvar",
  className = "",
  encType,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  encType?: "multipart/form-data";
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const msgRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state) msgRef.current?.focus();
  }, [state]);
  return (
    // Envio manual (sem action={...}) para o React não limpar os campos quando há erro de validação
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className={`space-y-6 ${className}`}
      encType={encType}
    >
      {children}
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-4 border-t border-line bg-carbon/95 px-1 py-4 backdrop-blur">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </button>
        {state && (
          <p ref={msgRef} tabIndex={-1} role="status" className={`text-sm outline-none ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
