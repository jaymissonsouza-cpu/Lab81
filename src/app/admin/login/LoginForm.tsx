"use client";

import { startTransition, useActionState } from "react";
import { loginAction, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="panel mt-8 space-y-4 p-6"
    >
      <div>
        <label htmlFor="email" className="field-label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm text-red-400">{state.message}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
