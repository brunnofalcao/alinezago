import type { Metadata } from "next";
import { LeadForm } from "@/components/site/LeadForm";
import { Section, Heading } from "@/components/site/Section";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Contato" };

export default function ContatoPage() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Heading as="h1" sub="Para agendar consulta, o caminho mais rápido é o WhatsApp. Para imprensa, parcerias e palestras, use o formulário.">Contato</Heading>
          <a href={whatsappLink(site.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary mt-8">WhatsApp {site.whatsappDisplay}</a>
          <ul className="mt-10 space-y-1 text-pedra-600">{site.cities.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div className="card p-6 sm:p-8 lg:col-span-6 lg:col-start-7">
          <LeadForm type="outro" source="contato" />
        </div>
      </div>
    </Section>
  );
}
