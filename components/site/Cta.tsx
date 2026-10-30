import Link from "next/link";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

export function CtaConsulta({ title = "Pronta(o) para parar de adivinhar?", text = "A primeira consulta é uma investigação completa, online, de qualquer lugar do Brasil." }: { title?: string; text?: string }) {
  return (
    <section className="relative overflow-hidden bg-taupe">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={site.brand.isotipoClaro} alt="" aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-[22rem] w-auto opacity-20 sm:-right-6 sm:h-[28rem]" />
      <div className="container-site relative flex flex-col gap-8 py-14 sm:py-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-d-2 font-light text-grafite">{title}</h2>
          <p className="mt-4 text-lg text-grafite/80">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.")} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary">Agendar consulta online</a>
          <Link href="/atendimentos" className="btn btn-lg btn-outline">Como funciona</Link>
        </div>
      </div>
    </section>
  );
}
