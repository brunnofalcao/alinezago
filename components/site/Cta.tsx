import Link from "next/link";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

export function CtaConsulta({ title = "Pronta(o) para parar de adivinhar?", text = "A primeira consulta é uma investigação completa, online, de qualquer lugar do Brasil." }: { title?: string; text?: string }) {
  return (
    <section className="bg-taupe">
      <div className="container-site flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-d-2 font-light text-grafite">{title}</h2>
          <p className="mt-4 text-lg text-grafite/80">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.")} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary">Agendar consulta online</a>
          <Link href="/atendimentos" className="btn btn-lg btn-outline">Como funciona</Link>
        </div>
      </div>
    </section>
  );
}
