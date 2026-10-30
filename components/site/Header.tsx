"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-taupe-line/70 bg-creme/90 backdrop-blur">
      <div className="container-site flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "font-display text-[15px] font-medium text-grafite/80 transition-colors hover:text-grafite",
                path.startsWith(n.href) && "text-grafite underline decoration-taupe decoration-2 underline-offset-8",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/entrar" className="font-display text-[15px] font-medium text-grafite/80 hover:text-grafite">
            Entrar
          </Link>
          <a href={whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.")} target="_blank" rel="noreferrer" className="btn btn-md btn-primary">
            Agendar consulta
          </a>
        </nav>
        <button className="md:hidden p-2 text-grafite" aria-expanded={open} aria-controls="menu-mobile" aria-label="Abrir menu" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div id="menu-mobile" className="border-t border-taupe-line bg-creme md:hidden">
          <nav className="container-site flex flex-col py-3" aria-label="Principal (mobile)">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-3 font-display text-base font-medium text-grafite">
                {n.label}
              </Link>
            ))}
            <Link href="/entrar" onClick={() => setOpen(false)} className="py-3 font-display text-base font-medium text-grafite">
              Entrar na comunidade
            </Link>
            <a href={whatsappLink(site.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary mt-2 mb-3">
              Agendar consulta
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
