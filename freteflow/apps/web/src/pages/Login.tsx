import { FormEvent, useState } from "react";
import { useAuthStore } from "../store/auth.store";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo2fa, setCodigo2fa] = useState("");
  const { error, loading, requiresTwoFactor, login } = useAuthStore();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email, senha, requiresTwoFactor ? codigo2fa : undefined);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-12 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,211,173,0.16),transparent_30%),radial-gradient(circle_at_90%_78%,rgba(244,166,76,0.14),transparent_32%)]" />
          <div className="relative">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-mint">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-ink">
                FF
              </span>
              FRETEFLOW
            </div>
            <div className="mt-28 max-w-xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-amber">
                Centro de comando logístico
              </p>
              <h1 className="font-display text-6xl leading-[0.96] tracking-tight text-white xl:text-7xl">
                Cada entrega, no compasso certo.
              </h1>
              <p className="mt-7 max-w-md text-lg leading-8 text-slate-400">
                Operação, frota e visibilidade reunidas em uma única superfície
                de controle.
              </p>
            </div>
          </div>
          <div className="relative flex items-end justify-between text-xs text-slate-500">
            <span>PLATAFORMA OPERACIONAL</span>
            <span>v0.1 / LOCAL</span>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-12 lg:hidden">
              <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-mint">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-ink">
                  FF
                </span>
                FRETEFLOW
              </div>
            </div>

            <div className="mb-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber">
                Acesso seguro
              </p>
              <h2 className="font-display text-4xl tracking-tight text-white">
                Bem-vindo de volta.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Entre para acompanhar a operação em tempo real.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div
                  className="border border-coral/30 bg-coral/10 px-4 py-3 text-sm leading-6 text-coral"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  E-mail
                </span>
                <input
                  className="field"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@empresa.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Senha
                </span>
                <input
                  className="field"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Sua senha"
                  minLength={8}
                  required
                />
              </label>

              {requiresTwoFactor && (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Código autenticador
                  </span>
                  <input
                    className="field tracking-[0.45em]"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={codigo2fa}
                    onChange={(event) =>
                      setCodigo2fa(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                  />
                </label>
              )}

              <button
                className="button-primary"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Validando acesso..."
                  : requiresTwoFactor
                    ? "Confirmar código"
                    : "Entrar na plataforma"}
                <span aria-hidden="true">-&gt;</span>
              </button>
            </form>

            <p className="mt-10 text-center text-xs leading-5 text-slate-500">
              Ambiente local protegido por sessão segura, 2FA e controle de
              acesso por perfil.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
