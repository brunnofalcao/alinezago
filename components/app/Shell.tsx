import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { ShellNav } from "@/components/app/ShellNav";

export type NavItem = { href: string; label: string; icon: string };

export function Shell({ children, nav, title, user, badge }: { children: React.ReactNode; nav: NavItem[]; title: string; user: { name: string; email: string }; badge?: string }) {
  return (
    <div className="min-h-screen bg-creme lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-b border-taupe-line bg-grafite text-marfim lg:min-h-screen lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Logo dark compact />
          <div className="hidden pt-4 lg:block">
            <p className="font-display text-sm font-medium tracking-[0.12em] text-taupe">{title}</p>
            {badge && <span className="badge mt-2 bg-marfim/10 text-marfim/80">{badge}</span>}
          </div>
        </div>
        <ShellNav items={nav} />
        <div className="mt-auto hidden border-t border-marfim/10 p-5 text-sm lg:block">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-marfim/60">{user.email}</p>
          <form action="/auth/sair" method="post" className="mt-3">
            <button className="text-marfim/70 underline-offset-4 hover:underline">Sair</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="container-site py-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}

export function PageTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-d-3 font-light text-grafite">{title}</h1>
        {text && <p className="mt-2 max-w-prose text-pedra-600">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("card shadow-app", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-taupe-line px-5 py-3.5">
          {title && <h2 className="font-display text-base font-medium text-grafite">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5 shadow-app">
      <p className="text-sm text-pedra-600">{label}</p>
      <p className="mt-2 font-display text-3xl font-light text-grafite">{value}</p>
      {hint && <p className="mt-1 text-xs text-pedra">{hint}</p>}
    </div>
  );
}

export function Empty({ title = "Não há dados disponíveis ainda.", text, action }: { title?: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-taupe-line bg-white/60 p-6">
      <p className="font-display text-base font-medium text-grafite">{title}</p>
      {text && <p className="max-w-prose text-sm text-pedra-600">{text}</p>}
      {action}
    </div>
  );
}

export function ConfigNotice({ title = "Falta configuração.", text, href = "/admin/configuracoes" }: { title?: string; text: string; href?: string }) {
  return (
    <div className="flex flex-col gap-2 border border-aviso/40 bg-aviso/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display font-medium text-grafite">{title}</p>
        <p className="text-sm text-pedra-600">{text}</p>
      </div>
      <Link href={href} className="btn btn-sm btn-outline">Ver configurações</Link>
    </div>
  );
}

const tones: Record<string, string> = {
  ativo: "bg-ok/10 text-ok",
  pendente: "bg-aviso/10 text-aviso",
  inativo: "bg-pedra/15 text-pedra-600",
  presente: "bg-ok/10 text-ok",
  ausente: "bg-erro/10 text-erro",
  justificada: "bg-aviso/10 text-aviso",
  ao_vivo: "bg-erro/10 text-erro",
  agendada: "bg-taupe/30 text-taupe-deep",
  encerrada: "bg-pedra/15 text-pedra-600",
  novo: "bg-taupe/30 text-taupe-deep",
  contatado: "bg-ok/10 text-ok",
  encerrado: "bg-pedra/15 text-pedra-600",
  sent: "bg-ok/10 text-ok",
  delivered: "bg-ok/10 text-ok",
  read: "bg-ok/10 text-ok",
  failed: "bg-erro/10 text-erro",
};
const labels: Record<string, string> = { ao_vivo: "Ao vivo", agendada: "Agendada", encerrada: "Encerrada", sent: "Enviada", delivered: "Entregue", read: "Lida", failed: "Falhou" };

export function Badge({ value }: { value: string }) {
  return <span className={cn("badge", tones[value] ?? "bg-pedra/15 text-pedra-600")}>{labels[value] ?? value}</span>;
}

export function Flash({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  return (
    <p role="status" className={cn("mb-6 border px-4 py-3 text-sm", erro ? "border-erro/40 bg-erro/5 text-erro" : "border-ok/40 bg-ok/5 text-ok")}>
      {erro ?? ok}
    </p>
  );
}
