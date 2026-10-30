import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";
import { Section } from "@/components/site/Section";
import { integrations } from "@/lib/env";

export const metadata: Metadata = { title: "Solicitar acesso à comunidade", robots: { index: false } };

export default function CadastroPage() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="text-d-2 font-light text-grafite">Solicitar acesso</h1>
          <p className="mt-4 text-pedra-600">A comunidade é exclusiva para pacientes em acompanhamento. Depois do cadastro, a equipe confirma seus dados e libera o acesso em até 2 dias úteis.</p>
        </div>
        <div className="card p-6 sm:p-8 lg:col-span-6 lg:col-start-7">
          <AuthForm mode="cadastro" configured={integrations.supabase()} />
        </div>
      </div>
    </Section>
  );
}
