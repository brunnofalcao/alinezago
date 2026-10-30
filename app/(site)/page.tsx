import Link from "next/link";
import { Check } from "lucide-react";
import { Figure } from "@/components/site/Figure";
import { Section, Heading } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { CtaConsulta } from "@/components/site/Cta";
import { metodoIcons } from "@/components/site/BrandIcons";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

const ramp = ["bg-grafite text-marfim", "bg-pedra-700 text-marfim", "bg-pedra text-marfim", "bg-taupe text-grafite"];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <div className="container-site grid items-center gap-8 pb-16 pt-8 sm:pb-20 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-16">
          <div className="lg:col-span-6">
            <p className="eyebrow reveal reveal-1">Médica. Atendimento online para todo o Brasil.</p>
            <h1 className="reveal reveal-2 mt-4 text-d-1 font-light text-grafite sm:mt-5">{site.hero.title}</h1>
            <p className="reveal reveal-3 mt-5 max-w-prose text-lead text-pedra-600 sm:mt-7">{site.hero.text}</p>
            <div className="reveal reveal-4 mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <a href={whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.")} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary">
                {site.hero.cta}
              </a>
              <a href="#metodo" className="btn btn-lg btn-outline">{site.hero.ctaSecondary}</a>
            </div>
          </div>
          <div className="reveal reveal-2 relative lg:col-span-6">
            <Figure src={site.images.heroHome} alt="Dra. Aline Zago, médica" className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" label="Foto principal (hero)" priority />
            <div className="bg-taupe p-5 sm:absolute sm:-bottom-8 sm:-left-8 sm:max-w-xs sm:p-6">
              <p className="font-display text-lg font-medium text-grafite">Consulta online, de onde você estiver.</p>
              <p className="mt-2 text-sm text-grafite/80">Agenda presencial reduzida em Brasília. Investigação completa já na primeira consulta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* O que você encontra */}
      <Section tone="white">
        <Heading>O que você encontra aqui</Heading>
        <ul className="mt-12 grid gap-10 md:grid-cols-3">
          {site.encontra.map((item, i) => (
            <li key={item} className="border-t-2 border-taupe pt-6">
              <span className="eyebrow">0{i + 1}</span>
              <p className="mt-3 text-lg leading-snug text-grafite">{item}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Link href="/sobre" className="btn btn-md btn-outline">Sobre a Dra. Aline Zago</Link>
        </div>
      </Section>

      {/* Faz sentido pra você */}
      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-d-2 font-light">Isso costuma fazer sentido pra você se:</h2>
            <p className="mt-6 text-marfim/70">Se você se reconhece em dois ou mais pontos, o problema provavelmente não é esforço. É direção.</p>
          </div>
          <ul className="space-y-5 lg:col-span-6 lg:col-start-7">
            {site.fazSentido.map((item) => (
              <li key={item} className="flex gap-4 border-b border-marfim/10 pb-5 text-lg">
                <Check className="mt-1 shrink-0 text-taupe" size={20} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Método */}
      <section id="metodo" className="bg-creme py-20 sm:py-28">
        <div className="container-site">
          <Heading sub="Clareza, método e acompanhamento. Quatro etapas, cada uma com um papel no processo.">Como eu trabalho</Heading>
        </div>
        <ol className="mt-10 grid sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {site.metodo.map((step, i) => {
            const Icon = metodoIcons[i];
            return (
              <li key={step.title} className={`flex flex-col gap-8 p-6 sm:min-h-[340px] sm:justify-between sm:p-8 ${ramp[i]}`}>
                <div className="flex items-start justify-between">
                  <span className="font-display text-4xl font-light sm:text-5xl">{i + 1}</span>
                  <Icon className={`h-16 w-16 sm:h-20 sm:w-20 ${i === 3 ? "text-grafite/70" : "text-taupe"}`} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium">{step.title}</h3>
                  <p className="mt-2 opacity-80 sm:mt-3">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Consulta online */}
      <Section tone="white" id="consulta-online">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Heading sub="A distância não muda a profundidade da investigação. Muda só o deslocamento.">A consulta online, passo a passo</Heading>
            <a href={whatsappLink(site.whatsapp, "Olá, Dra. Aline. Quero agendar uma consulta online.")} target="_blank" rel="noreferrer" className="btn btn-md btn-primary mt-8">Agendar pelo WhatsApp</a>
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

      {/* Palestrante */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <Heading sub="Nutrologia, medicina integrativa, obesidade, saúde metabólica, saúde da mulher e lipedema para congressos, laboratórios e marcas de saúde.">Palestrante e porta-voz científica</Heading>
            <Link href="/midia-kit" className="btn btn-md btn-outline mt-8">Ver mídia kit</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:col-span-7">
            {site.images.palestras.slice(0, 3).map((img, i) => (
              <Figure key={img.local} src={img} alt={`Dra. Aline Zago palestrando, foto ${i + 1}`} className="aspect-square" label={`Palestra ${i + 1}`} />
            ))}
          </div>
        </div>
      </Section>

      {/* Comunidade */}
      <Section tone="areia">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="text-d-2 font-light text-grafite">{site.comunidade.title}</h2>
            <p className="mt-5 max-w-prose text-lg text-grafite/80">{site.comunidade.text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:col-start-8 lg:justify-start lg:self-end">
            <Link href="/cadastro" className="btn btn-lg btn-primary">Solicitar acesso</Link>
            <Link href="/entrar" className="btn btn-lg btn-outline">Já sou paciente</Link>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><Heading>Perguntas frequentes</Heading></div>
          <div className="lg:col-span-7 lg:col-start-6"><Faq items={site.faq} /></div>
        </div>
      </Section>

      <CtaConsulta />
    </>
  );
}
