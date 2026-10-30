import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";
import { Section } from "@/components/site/Section";
import { integrations } from "@/lib/env";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const sp = await searchParams;
  return (
    <Section>
      <div className="mx-auto max-w-md">
        <h1 className="text-d-2 font-light text-grafite">Entrar na comunidade</h1>
        <p className="mt-4 text-pedra-600">Sem senha. Digite seu e-mail e receba um link de acesso.</p>
        {sp.erro === "link" && <p className="mt-4 text-sm text-erro">O link expirou ou já foi usado. Peça um novo link abaixo.</p>}
        <div className="mt-8">
          <AuthForm mode="entrar" configured={integrations.supabase()} next={sp.next} />
        </div>
      </div>
    </Section>
  );
}
