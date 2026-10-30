import { PageTitle, Card } from "@/components/app/Shell";
import { integrations, env } from "@/lib/env";
import { site } from "@/content/site";

function Row({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div><p className="font-medium text-grafite">{label}</p><p className="text-sm text-pedra-600">{detail}</p></div>
      <span className={`badge shrink-0 ${ok ? "bg-ok/10 text-ok" : "bg-aviso/10 text-aviso"}`}>{ok ? "Conectado" : "Falta configuração"}</span>
    </li>
  );
}

export default function ConfiguracoesAdmin() {
  const webhook = `${env.siteUrl}/api/whatsapp/webhook`;
  return (
    <>
      <PageTitle title="Configurações" text="Estado das integrações. Os valores são definidos nas variáveis de ambiente da Vercel, nunca aqui." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Integrações">
          <ul className="divide-y divide-taupe-line">
            <Row label="Supabase (banco e login)" ok={integrations.supabase()} detail="NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY" />
            <Row label="Supabase service role (formulários públicos e webhook)" ok={integrations.supabaseAdmin()} detail="SUPABASE_SERVICE_ROLE_KEY" />
            <Row label="Resend (e-mails)" ok={integrations.resend()} detail={`RESEND_API_KEY e EMAIL_FROM${env.emailFrom ? `: ${env.emailFrom}` : ""}`} />
            <Row label="E-mail de destino dos contatos" ok={integrations.contact()} detail={env.contactTo || "CONTACT_TO_EMAIL"} />
            <Row label="Meta WhatsApp Cloud API (envio)" ok={integrations.whatsapp()} detail={`WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN (${env.waVersion})`} />
            <Row label="Meta WhatsApp webhook (recebimento)" ok={integrations.whatsappWebhook()} detail="WHATSAPP_VERIFY_TOKEN e META_APP_SECRET" />
            <Row label="Cron de lembretes" ok={integrations.cron()} detail="CRON_SECRET (Vercel envia como Bearer)" />
          </ul>
        </Card>
        <div className="space-y-6">
          <Card title="Webhook da Meta">
            <p className="text-sm text-pedra-600">Cadastre no app Meta, em WhatsApp, Configuração, Webhook. Assine o campo <code className="bg-creme px-1">messages</code>.</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-pedra-600">URL de callback</dt><dd className="break-all font-mono text-xs text-grafite">{webhook}</dd></div>
              <div><dt className="text-pedra-600">Token de verificação</dt><dd className="text-grafite">{env.waVerifyToken ? "definido" : "não definido"}</dd></div>
              <div><dt className="text-pedra-600">Templates esperados</dt><dd className="text-grafite">{env.waTplLembrete} ({"{{1}}"} nome, {"{{2}}"} aula, {"{{3}}"} horário, {"{{4}}"} link) e {env.waTplBoasVindas} ({"{{1}}"} nome, {"{{2}}"} link)</dd></div>
            </dl>
          </Card>
          <Card title="Site">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-pedra-600">URL pública</dt><dd className="text-grafite">{env.siteUrl}</dd></div>
              <div><dt className="text-pedra-600">WhatsApp de atendimento</dt><dd className="text-grafite">{site.whatsappDisplay}</dd></div>
              <div><dt className="text-pedra-600">Conteúdo editável</dt><dd className="text-grafite">content/site.ts (textos, números do mídia kit, fotos)</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
