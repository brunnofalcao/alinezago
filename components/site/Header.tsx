"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { site } from "@/content/site";
import { cn, whatsappLink } from "@/lib/utils";

const nav = [
  { href: "/sobre", label: "Sobre" },
  { href: "/atendimentos", label: "Atendimentos" },
  { href: "/comunidade", label: "Comunidade" },
  { href: "/midia-kit", label: "Mídia kit" },
];

const WA = whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.");

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // fecha ao navegar, trava o scroll do body e fecha com Esc
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.documentElement.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-taupe-line/70 bg-creme/90 pt-safe backdrop-blur-md">
        <div className="container-site flex h-16 items-center justify-between gap-6 sm:h-20">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={cn("font-display text-[15px] text-grafite/75 transition-colors hover:text-grafite", path.startsWith(n.href) && "text-grafite underline decoration-taupe decoration-2 underline-offset-8")}>
                {n.label}
              </Link>
            ))}
            <Link href="/entrar" className="font-display text-[15px] text-grafite/75 hover:text-grafite">Entrar</Link>
            <a href={WA} target="_blank" rel="noreferrer" className="btn btn-md btn-primary">Agendar consulta</a>
          </nav>
          <button className="-mr-2 flex h-11 w-11 items-center justify-center text-grafite md:hidden" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Painel do menu fora do <header>: backdrop-filter no header viraria o containing block do fixed */}
      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-[calc(4rem+var(--safe-top))] z-[35] flex flex-col bg-creme md:hidden" role="dialog" aria-label="Menu">
          <nav className="container-site flex flex-1 flex-col overflow-y-auto pt-2" aria-label="Principal (mobile)">
            <Link href="/" className={cn("border-b border-taupe-line py-4 font-display text-2xl font-light text-grafite", path === "/" && "text-taupe-deep")}>Início</Link>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={cn("border-b border-taupe-line py-4 font-display text-2xl font-light text-grafite", path.startsWith(n.href) && "text-taupe-deep")}>
                {n.label}
              </Link>
            ))}
            <Link href="/entrar" className="border-b border-taupe-line py-4 font-display text-2xl font-light text-grafite">Área de membros</Link>
          </nav>
          <div className="container-site pb-[calc(1.25rem+var(--safe-bottom))] pt-4">
            <a href={WA} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary w-full">Agendar consulta online</a>
            <p className="mt-3 text-center text-xs text-pedra">{site.fullName} · {site.crm}</p>
          </div>
        </div>
      )}
    </>
  );
}
