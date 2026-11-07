import { requireAdmin } from "@/lib/auth";
import { AdminForm } from "@/components/admin/AdminForm";
import { Section } from "@/components/admin/Fields";
import { changePasswordAction } from "../../actions";

export const metadata = { title: "Minha conta" };

function PwField({ id, label, autoComplete, hint }: { id: string; label: string; autoComplete: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={`pw-${id}`} className="field-label">
        {label}
      </label>
      <input id={`pw-${id}`} name={id} type="password" autoComplete={autoComplete} required className="field" />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export default async function ContaPage() {
  const session = await requireAdmin();
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold">Minha conta</h1>
      <p className="mt-2 text-titanium">
        Login: <strong className="text-offwhite">{session.email}</strong>
      </p>
      <AdminForm action={changePasswordAction} className="mt-8" submitLabel="Alterar senha">
        <Section title="Alterar senha" description="Depois de alterar, outros aparelhos conectados precisarão entrar de novo.">
          <PwField id="current" label="Senha atual" autoComplete="current-password" hint="Na primeira troca, é a senha que aparece nos logs do EasyPanel." />
          <PwField id="next" label="Nova senha" autoComplete="new-password" hint="Mínimo de 8 caracteres." />
          <PwField id="confirm" label="Repita a nova senha" autoComplete="new-password" />
        </Section>
      </AdminForm>
    </div>
  );
}
