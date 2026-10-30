import type { Metadata } from "next";
import { Figure } from "@/components/site/Figure";
import { Section, Heading } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { CtaConsulta } from "@/components/site/Cta";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Atendimentos: consulta online, emagrecimento e lipedema", description: "Acompanhamento médico em emagrecimento, saúde metabólica e lipedema. Consulta online para todo o Brasil e presencial em Brasília." };

export default function AtendimentosPage() {
  const a = site.atendimentos;
  return (
    <>
      <section className="container-site grid gap-10 pb-16 pt-10 lg:grid-cols-12 lg:pt-16">
        <div className="lg:col-span-6">
          <h1 className="text-d-1 font-light text-grafite">Emagrecimento não é punição. É estratégia.</h1>
          <div className="mt-8 space-y-5 text-lg text-pedra-600">
            {a.emagrecimento.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Figure src={site.images.atendimentos} alt="Dra. Aline Zago" className="aspect-[4/5]" label="Foto da página Atendimentos" priority />
        </div>
      </section>

      <Section tone="white" id="consulta-online">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Heading sub="O foco do atendimento é digital. Você faz a consulta por vídeo, de onde estiver, e o acompanhamento continua pela comunidade.">A consulta online</Heading>
          </div>
          <ol className="grid gap-8 lg:col-span-7 lg:col-start-6">
            {site.consultaOnline.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[auto_1fr] gap-5 border-t border-taupe-line pt-6">
                <span className="font-display text-2xl font-light text-taupe-deep">{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-medium text-grafite">{s.title}</h3>
                  <p className="mt-2 max-w-prose text-pedra-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="dark" id="lipedema">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-d-2 font-light">Lipedema: clareza, respeito e cuidado responsável</h2>
            <p className="mt-6 text-lg text-marfim/80">{a.lipedema.intro}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-lg text-marfim/80">{a.lipedema.objetivoIntro}</p>
            <ul className="mt-5 space-y-3">
              {a.lipedema.objetivos.map((o) => (
                <li key={o} className="border-l-2 border-taupe pl-4 text-lg">{o}</li>
              ))}
            </ul>
            <p className="mt-8 font-display text-xl font-light text-taupe">{a.lipedema.fecho}</p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Heading>Como funciona o acompanhamento</Heading>
            <div className="mt-8 space-y-5 text-lg text-pedra-600">
              {a.acompanhamento.map((p) => <p key={p}>{p}</p>)}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="text-d-3 font-light text-grafite">Para quem é essa forma de cuidar</h2>
            <ul className="mt-6 space-y-3">
              {a.paraQuem.map((p) => (
                <li key={p} className="border-b border-taupe-line pb-3 text-lg text-grafite">{p}</li>
              ))}
            </ul>
            <p className="mt-6 text-pedra-600">{a.naoE}</p>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-d-2 font-light text-grafite">Em essência</h2>
            {a.essencia.map((p) => <p key={p} className="mt-5 text-lg text-pedra-600">{p}</p>)}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Faq items={site.faq} />
          </div>
        </div>
      </Section>

      <CtaConsulta />
    </>
  );
}
