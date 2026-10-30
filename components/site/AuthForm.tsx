"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "entrar" | "cadastro";
type State = { status: "idle" | "sending" | "sent" | "error"; message?: string };

export function AuthForm({ mode, configured, next }: { mode: Mode; configured: boolean; next?: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const full_name = String(fd.get("full_name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const consent = fd.get("consent") === "on";
    if (mode === "cadastro" && (!full_name || !phone)) {
      setState({ status: "error", message: "Preencha nome e WhatsApp para continuar." });
      return;
    }
    setState({ status: "sending" });
    const supabase = createClient();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || "/membros")}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect,
        shouldCreateUser: mode === "cadastro",
        data: mode === "cadastro" ? { full_name, phone, consent_whatsapp: consent } : undefined,
      },
    });
    if (error) {
      const msg = /signups not allowed|Signups not allowed/i.test(error.message)
        ? "Este e-mail ainda não tem cadastro. Solicite acesso primeiro."
        : error.message;
      setState({ status: "error", message: msg });
      return;
    }
    setState({ status: "sent", message: `Enviamos um link de acesso para ${email}. Abra o e-mail e clique no link para entrar.` });
  }

  if (!configured) {
    return (
      <div className="card border-aviso/40 bg-aviso/5 p-6">
        <p className="font-display text-lg font-medium text-grafite">Falta configuração.</p>
        <p className="mt-2 text-sm text-pedra-600">A área de membros ainda não está conectada ao Supabase. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente e publique novamente.</p>
      </div>
    );
  }

  if (state.status === "sent") {
    return (
      <div className="card border-ok/30 bg-ok/5 p-6" role="status">
        <p className="font-display text-lg font-medium text-grafite">Verifique seu e-mail</p>
        <p className="mt-2 text-pedra-600">{state.message}</p>
        <p className="mt-4 text-sm text-pedra">Não chegou? Confira o spam ou tente novamente em um minuto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {mode === "cadastro" && (
        <>
          <div>
            <label className="label" htmlFor="full_name">Nome completo</label>
            <input id="full_name" name="full_name" required className="field" autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="phone">WhatsApp</label>
            <input id="phone" name="phone" required inputMode="tel" placeholder="(61) 99999-9999" className="field" autoComplete="tel" />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      {mode === "cadastro" && (
        <label className="flex items-start gap-3 text-sm text-pedra-600">
          <input type="checkbox" name="consent" defaultChecked className="mt-1 h-4 w-4 accent-taupe-deep" />
          <span>Aceito receber avisos e lembretes das aulas pelo WhatsApp. Posso cancelar quando quiser.</span>
        </label>
      )}
      <button type="submit" className="btn btn-lg btn-primary mt-2" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Enviando..." : mode === "cadastro" ? "Solicitar acesso" : "Receber link de acesso"}
      </button>
      {state.message && <p role="alert" className={cn("text-sm", state.status === "error" ? "text-erro" : "text-ok")}>{state.message}</p>}
      <p className="text-sm text-pedra-600">
        {mode === "cadastro" ? (
          <>Já tem acesso? <Link href="/entrar" className="underline">Entrar</Link></>
        ) : (
          <>Ainda não é paciente da comunidade? <Link href="/cadastro" className="underline">Solicitar acesso</Link></>
        )}
      </p>
    </form>
  );
}
