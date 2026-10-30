import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/site/Figure";
import { Section, Heading } from "@/components/site/Section";
import { CtaConsulta } from "@/components/site/Cta";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Sobre", description: site.sobre.paragrafos[0] };

export default function SobrePage() {
  return (
    <>
      <section className="container-site grid gap-10 pb-16 pt-10 lg:grid-cols-12 lg:pt-16">
        <div className="lg:col-span-5">
          <h1 className="text-d-1 font-light text-grafite">{site.sobre.title}</h1>
        </div>
        <div className="lg:col-span-7">
          <Figure src={site.images.heroSobre} alt="Dra. Aline Zago em consultório" className="aspect-[16/10]" label="Foto da página Sobre" priority />
        </div>
      </section>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-lg leading-relaxed text-pedra-600 lg:col-span-7">
            {site.sobre.paragrafos.map((p, i) => (
              <p key={i} className={i === 1 ? "font-display text-2xl font-light text-grafite" : undefined}>{p}</p>
            ))}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-taupe-line p-6">
              <p className="font-display text-sm font-medium tracking-[0.12em] text-taupe-deep">Registro profissional</p>
              <p className="mt-2 text-lg text-grafite">{site.name}</p>
              <p className="text-pedra-600">{site.crm}</p>
              <p className="mt-6 font-display text-sm font-medium tracking-[0.12em] text-taupe-deep">Atendimento</p>
              <ul className="mt-2 space-y-1 text-pedra-600">
                {site.cities.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <Section>
        <Heading sub={site.sobre.focoIntro}>Áreas de foco e abordagem médica</Heading>
        <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:max-w-4xl">
          {site.sobre.foco.map((f) => (
            <li key={f} className="border-b border-taupe-line pb-4 text-lg text-grafite">{f}</li>
          ))}
        </ul>
      </Section>

      <Section tone="white" id="palestrante">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Heading sub={site.mediaKit.intro}>Atuação educacional</Heading>
            <Link href="/midia-kit" className="btn btn-md btn-outline mt-8">Convidar para palestra</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
            {site.images.palestras.map((img, i) => (
              <Figure key={img.local} src={img} alt={`Dra. Aline Zago em palestra, foto ${i + 1}`} className="aspect-square" label={`Palestra ${i + 1}`} />
            ))}
          </div>
        </div>
      </Section>

      <CtaConsulta />
    </>
  );
}
