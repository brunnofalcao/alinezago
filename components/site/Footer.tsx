import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { LeadForm } from "@/components/site/LeadForm";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="bg-grafite text-marfim">
      <div className="container-site grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo dark size="lg" />
          <p className="mt-7 max-w-sm text-marfim/70">
            Atendimento online para todo o Brasil e presencial em Brasília. Emagrecimento, saúde metabólica, lipedema e saúde da mulher com método e acompanhamento.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-marfim/80">
            {site.cities.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={whatsappLink(site.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-md btn-accent">Falar no WhatsApp</a>
            <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center text-marfim/70 hover:text-marfim"><Instagram size={20} /></a>
            <a href={site.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-11 w-11 items-center justify-center text-marfim/70 hover:text-marfim"><Youtube size={20} /></a>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="font-display text-d-3 font-light">Entre em contato</h2>
          <p className="mb-6 mt-2 text-marfim/70">Para consultas, use o WhatsApp. Para parcerias, imprensa e palestras, escreva aqui ou acesse o mídia kit.</p>
          <LeadForm type="outro" variant="dark" source="footer" />
        </div>
      </div>
      <div className="border-t border-marfim/10 pb-[calc(4.5rem+var(--safe-bottom))] md:pb-0">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-marfim/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.fullName}. {site.crm}. Todos os direitos reservados.</p>
          <nav className="flex gap-5" aria-label="Legal">
            <Link href="/politica-de-privacidade" className="py-1 hover:text-marfim">Privacidade</Link>
            <Link href="/midia-kit" className="py-1 hover:text-marfim">Mídia kit</Link>
            <Link href="/entrar" className="py-1 hover:text-marfim">Área de membros</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
