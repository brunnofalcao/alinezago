"use client";
import { useState } from "react";
import type { LeadType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  type: LeadType;
  variant?: "light" | "dark";
  showCompany?: boolean;
  messageLabel?: string;
  submitLabel?: string;
  source?: string;
};

type State = { status: "idle" | "sending" | "ok" | "error"; message?: string };

export function LeadForm({ type, variant = "light", showCompany = false, messageLabel = "Mensagem", submitLabel = "Enviar mensagem", source }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });
  const dark = variant === "dark";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, source: source ?? (typeof window !== "undefined" ? window.location.pathname : "") }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Não foi possível enviar agora.");
      form.reset();
      setState({ status: "ok", message: "Recebido. A equipe responde em até 1 dia útil." });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Não foi possível enviar agora." });
    }
  }

  const field = cn("field", dark && "border-marfim/20 bg-grafite-800 text-marfim placeholder:text-marfim/40 focus:border-taupe");
  const label = cn("label", dark && "text-marfim/80");

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`nome-${type}`}>Nome</label>
          <input id={`nome-${type}`} name="name" required className={field} autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor={`email-${type}`}>E-mail</label>
          <input id={`email-${type}`} name="email" type="email" required className={field} autoComplete="email" />
        </div>
        <div>
          <label className={label} htmlFor={`phone-${type}`}>WhatsApp</label>
          <input id={`phone-${type}`} name="phone" inputMode="tel" placeholder="(61) 99999-9999" className={field} autoComplete="tel" />
        </div>
        {showCompany && (
          <div>
            <label className={label} htmlFor={`company-${type}`}>Empresa ou evento</label>
            <input id={`company-${type}`} name="company" className={field} autoComplete="organization" />
          </div>
        )}
      </div>
      <div>
        <label className={label} htmlFor={`msg-${type}`}>{messageLabel}</label>
        <textarea id={`msg-${type}`} name="message" rows={4} className={field} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={cn("btn btn-md", dark ? "btn-accent" : "btn-primary")} disabled={state.status === "sending"}>
          {state.status === "sending" ? "Enviando..." : submitLabel}
        </button>
        {state.message && (
          <p role="status" className={cn("text-sm", state.status === "ok" ? (dark ? "text-taupe" : "text-ok") : "text-erro")}>{state.message}</p>
        )}
      </div>
      <p className={cn("text-xs", dark ? "text-marfim/50" : "text-pedra")}>Seus dados são usados apenas para responder a este contato, conforme a política de privacidade.</p>
    </form>
  );
}
