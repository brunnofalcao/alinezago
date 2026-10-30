import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Section, Heading } from "@/components/site/Section";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Comunidade de pacientes", description: site.comunidade.text };

export default function ComunidadePage() {
  return (
    <>
      <section className="container-site pb-16 pt-10 lg:pt-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Comunidade</p>
          <h1 className="mt-4 text-d-1 font-light text-grafite">{site.comunidade.title}</h1>
          <p className="mt-7 max-w-prose text-lead text-pedra-600">{site.comunidade.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
            <Link href="/cadastro" className="btn btn-lg btn-primary">Solicitar acesso</Link>
            <Link href="/entrar" className="btn btn-lg btn-outline">Já tenho acesso</Link>
          </div>
        </div>
      </section>
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><Heading>O que você encontra</Heading></div>
          <ul className="space-y-5 lg:col-span-7 lg:col-start-6">
            {site.comunidade.beneficios.map((b) => (
              <li key={b} className="flex gap-4 border-b border-taupe-line pb-5 text-lg text-grafite">
                <Check className="mt-1 shrink-0 text-taupe-deep" size={20} aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Heading>Como funciona o acesso</Heading>
          </div>
          <ol className="grid gap-6 lg:col-span-6 lg:col-start-7">
            {[
              ["Cadastro", "Você preenche nome, e-mail e WhatsApp. Sem senha: o acesso é por link enviado ao seu e-mail."],
              ["Aprovação", "A equipe confere se você está em acompanhamento e libera o acesso em até 2 dias úteis."],
              ["Aulas e presença", "Você entra nas aulas ao vivo pela comunidade. A presença é registrada automaticamente ao entrar na sala."],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[auto_1fr] gap-5 border-t border-taupe-line pt-5">
                <span className="font-display text-2xl font-light text-taupe-deep">{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-medium text-grafite">{t}</h3>
                  <p className="mt-2 text-pedra-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}
