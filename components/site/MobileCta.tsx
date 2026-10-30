"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

const HIDE = ["/entrar", "/cadastro", "/contato", "/politica-de-privacidade"];

/** Barra fixa de conversão no mobile. Some nas páginas de acesso e contato. */
export function MobileCta() {
  const path = usePathname();
  if (HIDE.some((h) => path.startsWith(h))) return null;
  const isMidia = path.startsWith("/midia-kit");
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-taupe-line bg-creme/95 pb-safe backdrop-blur-md md:hidden">
      <div className="container-site flex h-[4.5rem] items-center gap-3">
        {isMidia ? (
          <a href="#proposta" className="btn btn-md btn-primary flex-1">Solicitar proposta</a>
        ) : (
          <a href={whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.")} target="_blank" rel="noreferrer" className="btn btn-md btn-primary flex-1">
            <MessageCircle size={18} aria-hidden /> Agendar consulta
          </a>
        )}
      </div>
    </div>
  );
}
