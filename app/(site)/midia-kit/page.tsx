import type { Metadata } from "next";
import { Figure } from "@/components/site/Figure";
import { Section, Heading } from "@/components/site/Section";
import { LeadForm } from "@/components/site/LeadForm";
import { CopyButton } from "@/components/site/CopyButton";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Mídia kit: palestras, treinamentos e conteúdo científico",
  description: "Mídia kit da Dra. Aline Zago para congressos, laboratórios e marcas de saúde: temas, formatos, números, fotos oficiais e contato comercial.",
};

const bioCurta = `${site.name} é médica, palestrante em congressos médicos e porta-voz de conteúdo em saúde. Atua em nutrologia, medicina integrativa, obesidade e emagrecimento, performance e saúde metabólica, saúde da mulher e lipedema, com atendimento online para todo o Brasil e presencial em Brasília. ${site.crm}.`;
const bioLonga = `${site.name} é médica (${site.crm}), palestrante e empresária. Com atuação em nutrologia, medicina integrativa, obesidade e emagrecimento, performance e saúde metabólica, saúde da mulher e lipedema, construiu uma prática clínica guiada por uma premissa simples: corpos não falham por falta de força de vontade, falham quando estão desregulados.

Em palestras para congressos médicos, laboratórios e marcas de saúde, une embasamento científico, prática clínica e clareza na comunicação, da fisiopatologia à aplicação real no consultório e na vida do paciente. Seu conteúdo tem foco em estratégia, sustentabilidade de resultados e medicina baseada em evidências.

Atende pacientes online em todo o Brasil e presencialmente em Brasília, e conduz uma comunidade de acompanhamento com aulas ao vivo para pacientes.`;

export default function MidiaKitPage() {
  const mk = site.mediaKit;
  return (
    <>
      <section className="container-site grid gap-10 pb-16 pt-10 lg:grid-cols-12 lg:pt-16">
        <div className="lg:col-span-6">
          <p className="font-display text-sm font-medium tracking-[0.12em] text-taupe-deep">Mídia kit</p>
          <h1 className="mt-5 text-d-1 font-light text-grafite">{mk.headline}</h1>
          <p className="mt-7 max-w-prose text-lead text-pedra-600">{mk.intro}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#proposta" className="btn btn-lg btn-primary">Solicitar proposta</a>
            <a href="#materiais" className="btn btn-lg btn-outline">Bio e fotos oficiais</a>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Figure src={site.images.palestras[0]} alt="Dra. Aline Zago palestrando" className="aspect-[4/5]" label="Foto de palestra (destaque)" priority />
        </div>
      </section>

      {/* Números */}
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Heading sub="Alcance e experiência em números. Atualizado pela equipe.">Em números</Heading>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:col-span-7 lg:col-start-6">
            {mk.numeros.map((n) => (
              <div key={n.label} className="border-t-2 border-taupe pt-4">
                <dd className="font-display text-4xl font-light text-grafite">{n.value || <span className="text-pedra text-2xl">a confirmar</span>}</dd>
                <dt className="mt-2 text-sm text-pedra-600">{n.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Temas */}
      <Section>
        <Heading sub="Cada tema pode ser adaptado para público médico, equipe comercial ou paciente.">Temas de palestra</Heading>
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {mk.temas.map((t) => (
            <li key={t.title} className="border-t border-taupe-line pt-5">
              <h3 className="font-display text-xl font-medium text-grafite">{t.title}</h3>
              <p className="mt-2 text-pedra-600">{t.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Formatos */}
      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-d-2 font-light">Formatos</h2>
            <p className="mt-5 text-marfim/70">Presencial ou online. Conteúdo construído com a marca, com independência técnica.</p>
          </div>
          <ul className="divide-y divide-marfim/10 lg:col-span-7 lg:col-start-6">
            {mk.formatos.map((f) => (
              <li key={f.title} className="grid gap-2 py-5 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
                <h3 className="font-display text-lg font-medium">{f.title}</h3>
                <p className="text-marfim/75">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Galeria */}
      <Section tone="white">
        <Heading>Em cena</Heading>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {site.images.palestras.map((img, i) => (
            <Figure key={img.local} src={img} alt={`Dra. Aline Zago em palestra, foto ${i + 1}`} className="aspect-square" label={`Palestra ${i + 1}`} />
          ))}
        </div>
      </Section>

      {/* Marcas (só aparece com conteúdo) */}
      {mk.marcas.length > 0 && (
        <Section>
          <Heading>Quem já convidou</Heading>
          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4 font-display text-xl text-pedra-600">
            {mk.marcas.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </Section>
      )}

      {/* Compliance + Materiais */}
      <Section tone="taupe" id="materiais">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-d-2 font-light text-grafite">Compliance</h2>
            <p className="mt-5 text-lg text-grafite/80">{mk.compliance}</p>
          </div>
          <div className="space-y-8 lg:col-span-6 lg:col-start-7">
            <div>
              <h2 className="text-d-3 font-light text-grafite">Bio curta</h2>
              <p className="mt-3 text-grafite/80">{bioCurta}</p>
              <CopyButton text={bioCurta} label="Copiar bio curta" />
            </div>
            <div>
              <h2 className="text-d-3 font-light text-grafite">Bio longa</h2>
              <div className="mt-3 space-y-3 text-grafite/80">{bioLonga.split("\n\n").map((p) => <p key={p}>{p}</p>)}</div>
              <CopyButton text={bioLonga} label="Copiar bio longa" />
            </div>
            <div>
              <h2 className="text-d-3 font-light text-grafite">Crédito correto</h2>
              <p className="mt-3 text-grafite/80">{site.name}, {site.crm}. Médica, palestrante e empresária.</p>
              <CopyButton text={`${site.name}, ${site.crm}. Médica, palestrante e empresária.`} label="Copiar crédito" />
            </div>
            <div>
              <h2 className="text-d-3 font-light text-grafite">Fotos oficiais em alta</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {[site.images.heroHome, site.images.heroSobre, ...site.images.palestras].map((img, i) => (
                  <li key={img.local}>
                    <a href={img.local} download className="btn btn-sm btn-outline">Foto {i + 1}</a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-grafite/60">Uso autorizado apenas para divulgação de eventos e conteúdos com participação da Dra. Aline Zago.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Proposta */}
      <Section tone="white" id="proposta">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Heading sub="Conte o tema, o formato, a data e o público. A equipe comercial retorna em até 2 dias úteis com disponibilidade e proposta.">Solicitar proposta</Heading>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <LeadForm type="palestra" showCompany messageLabel="Tema, formato, data e público" submitLabel="Enviar solicitação" source="midia-kit" />
          </div>
        </div>
      </Section>
    </>
  );
}
