import Image from "next/image";
import { redirect } from "next/navigation";
import { authConfigured, getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const configured = authConfigured();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-layers p-5">
      <div className="w-full max-w-sm">
        <Image src="/brand/lab81-logo-completo.png" alt="LAB81 Studio" width={878} height={760} className="mx-auto h-20 w-auto" priority />
        <h1 className="mt-8 text-center font-display text-2xl">Painel administrativo</h1>
        {configured ? (
          <LoginForm />
        ) : (
          <div className="panel mt-8 p-5 text-sm text-titanium">
            <p className="font-medium text-offwhite">Acesso ainda não configurado.</p>
            <p className="mt-2">
              Defina <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> e <code>SESSION_SECRET</code> (32+ caracteres) no arquivo{" "}
              <code>.env</code> do servidor e reinicie a aplicação. Veja o README.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
