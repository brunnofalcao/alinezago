import { createClient } from "@/lib/supabase/server";
import { integrations, env } from "@/lib/env";
import { PageTitle, Card, Empty, Badge, Flash, ConfigNotice } from "@/components/app/Shell";
import { formatDateTime } from "@/lib/utils";
import { broadcast } from "../actions";
import type { MessageLog } from "@/lib/types";

export default async function MensagensAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from("message_log").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(60);
  const wa = integrations.whatsapp(), em = integrations.resend();
  return (
    <>
      <PageTitle title="Disparos" text="Mensagens em lote por WhatsApp (template aprovado) ou e-mail. Lembretes de aula saem sozinhos, a cada hora." />
      <Flash ok={sp.ok} erro={sp.erro} />
      {!wa && !em && <div className="mb-6"><ConfigNotice text="Nenhum canal conectado. Configure Resend e/ou Meta WhatsApp para habilitar os disparos." /></div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="WhatsApp (template)">
          {!wa ? <p className="text-sm text-pedra-600">Falta configuração: Meta WhatsApp.</p> : (
            <form action={broadcast} className="grid gap-4">
              <input type="hidden" name="channel" value="whatsapp" />
              <div><label className="label" htmlFor="aud-wa">Público</label><select id="aud-wa" name="audience" className="field" defaultValue="ativos"><option value="ativos">Membros ativos</option><option value="pendentes">Cadastros pendentes</option><option value="todos">Todos</option></select></div>
              <div><label className="label" htmlFor="template">Nome do template aprovado</label><input id="template" name="template" className="field" defaultValue={env.waTplBoasVindas} required /></div>
              <div><label className="label" htmlFor="params">Parâmetros do corpo, separados por |</label><input id="params" name="params" className="field" placeholder="{nome} | texto do {{2}} | ..." /><p className="mt-1 text-xs text-pedra">Use {"{nome}"} para o primeiro nome. Só envia para quem tem WhatsApp e consentimento.</p></div>
              <div><button className="btn btn-md btn-primary">Enviar template</button></div>
            </form>
          )}
        </Card>
        <Card title="E-mail">
          {!em ? <p className="text-sm text-pedra-600">Falta configuração: Resend.</p> : (
            <form action={broadcast} className="grid gap-4">
              <input type="hidden" name="channel" value="email" />
              <div><label className="label" htmlFor="aud-em">Público</label><select id="aud-em" name="audience" className="field" defaultValue="ativos"><option value="ativos">Membros ativos</option><option value="pendentes">Cadastros pendentes</option><option value="todos">Todos</option></select></div>
              <div><label className="label" htmlFor="subject">Assunto</label><input id="subject" name="subject" className="field" required /></div>
              <div><label className="label" htmlFor="body">Mensagem</label><textarea id="body" name="body" rows={5} className="field" required /></div>
              <div><button className="btn btn-md btn-primary">Enviar e-mail</button></div>
            </form>
          )}
        </Card>
        <Card title="Lembretes automáticos">
          <p className="text-sm text-pedra-600">24h e 1h antes de cada aula publicada, por e-mail e WhatsApp (com consentimento). Roda pelo cron da Vercel a cada hora.</p>
          <div className="mt-3"><Badge value={integrations.cron() ? "sent" : "failed"} /> <span className="ml-2 text-sm text-pedra-600">{integrations.cron() ? "Cron protegido e ativo" : "Falta configuração: CRON_SECRET"}</span></div>
          <p className="mt-3 text-xs text-pedra">Template usado: {env.waTplLembrete}</p>
        </Card>
      </div>
      <Card title="Últimas mensagens" className="mt-6 overflow-x-auto p-0">
        {error ? <p className="p-5 text-sm text-erro">Não foi possível carregar este módulo.</p> : (data ?? []).length === 0 ? <div className="p-5"><Empty title="Nenhuma mensagem registrada ainda." /></div> : (
          <table className="table-app w-full min-w-[640px]">
            <thead><tr><th>Quando</th><th>Canal</th><th>Para</th><th>Template</th><th>Status</th></tr></thead>
            <tbody>
              {((data ?? []) as Array<MessageLog & { profiles: { full_name: string | null } | null }>).map((x) => (
                <tr key={x.id}><td className="text-pedra-600">{formatDateTime(x.created_at)}</td><td>{x.direction === "in" ? "Recebida" : "Enviada"} · {x.channel}</td><td>{x.profiles?.full_name || x.to_ref}</td><td className="text-pedra-600">{x.template ?? ""}</td><td><Badge value={x.status} /></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
