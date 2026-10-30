import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { integrations, env } from "@/lib/env";
import { Card, Badge, Flash, Empty } from "@/components/app/Shell";
import { formatDateTime, pct, whatsappLink } from "@/lib/utils";
import { setMemberStatus, updateMemberNotes, addInteraction, sendMemberMessage } from "../../actions";
import type { Profile, Interaction, MessageLog } from "@/lib/types";

export default async function MembroDetalhe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const m = data as Profile;
  const [{ data: inter }, { data: msgs }, { data: att }, { count: totalAulas }] = await Promise.all([
    supabase.from("interactions").select("*").eq("profile_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("message_log").select("*").eq("profile_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("attendance").select("status, checked_at, live_classes(title, starts_at)").eq("profile_id", id).order("checked_at", { ascending: false }).limit(30),
    supabase.from("live_classes").select("id", { count: "exact", head: true }).eq("published", true).lt("starts_at", new Date().toISOString()).gte("starts_at", m.approved_at ?? m.created_at),
  ]);
  const presencas = (att ?? []).filter((a) => a.status === "presente").length;
  const inWindow = m.last_inbound_at && Date.now() - new Date(m.last_inbound_at).getTime() < 24 * 3600_000;

  return (
    <>
      <Link href="/admin/membros" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Membros</Link>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-d-3 font-light text-grafite">{m.full_name || m.email}</h1>
          <Badge value={m.status} />
          {m.role === "admin" && <span className="badge bg-grafite text-marfim">admin</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {m.status !== "ativo" && <form action={setMemberStatus}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="ativo" /><button className="btn btn-sm btn-primary">Aprovar acesso</button></form>}
          {m.status === "ativo" && <form action={setMemberStatus}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="inativo" /><button className="btn btn-sm btn-danger">Inativar</button></form>}
          {m.status === "inativo" && <form action={setMemberStatus}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="pendente" /><button className="btn btn-sm btn-outline">Voltar para pendente</button></form>}
          {m.phone && <a href={whatsappLink(m.phone)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">Abrir WhatsApp</a>}
        </div>
      </div>
      <div className="mt-6"><Flash ok={sp.ok} erro={sp.erro} /></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Dados e observações">
            <form action={updateMemberNotes} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={m.id} />
              <div><label className="label" htmlFor="full_name">Nome</label><input id="full_name" name="full_name" defaultValue={m.full_name ?? ""} className="field" /></div>
              <div><label className="label" htmlFor="phone">WhatsApp</label><input id="phone" name="phone" defaultValue={m.phone ?? ""} className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="tags">Tags (separadas por vírgula)</label><input id="tags" name="tags" defaultValue={m.tags.join(", ")} className="field" placeholder="lipedema, retorno em novembro" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="notes">Observações internas</label><textarea id="notes" name="notes" rows={4} defaultValue={m.notes ?? ""} className="field" /></div>
              <div className="sm:col-span-2 flex items-center justify-between gap-4">
                <p className="text-xs text-pedra">E-mail: {m.email} · cadastro em {formatDateTime(m.created_at)}{m.approved_at ? ` · aprovado em ${formatDateTime(m.approved_at)}` : ""}</p>
                <button className="btn btn-sm btn-primary">Salvar</button>
              </div>
            </form>
          </Card>

          <Card title="Linha do tempo do relacionamento">
            <form action={addInteraction} className="mb-5 grid gap-3 sm:grid-cols-[160px_1fr_auto]">
              <input type="hidden" name="id" value={m.id} />
              <select name="kind" className="field" defaultValue="nota" aria-label="Tipo">
                <option value="nota">Nota</option><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option><option value="email">E-mail</option><option value="consulta">Consulta</option>
              </select>
              <input name="content" className="field" placeholder="O que aconteceu? Ex.: retorno agendado para 12/11" required aria-label="Conteúdo" />
              <button className="btn btn-md btn-outline">Registrar</button>
            </form>
            {(inter ?? []).length === 0 ? <Empty title="Nenhuma interação registrada." text="Registre ligações, retornos e combinados para a equipe ter o histórico." /> : (
              <ul className="divide-y divide-taupe-line">
                {((inter ?? []) as Interaction[]).map((i) => (
                  <li key={i.id} className="py-3"><div className="flex items-center gap-2 text-xs text-pedra-600"><span className="badge bg-taupe/30 text-taupe-deep">{i.kind}</span>{formatDateTime(i.created_at)}</div><p className="mt-1 text-sm text-grafite">{i.content}</p></li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Mensagens enviadas e recebidas">
            {(msgs ?? []).length === 0 ? <Empty title="Nenhuma mensagem registrada." /> : (
              <ul className="divide-y divide-taupe-line">
                {((msgs ?? []) as MessageLog[]).map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-grafite">{x.direction === "in" ? "Recebida" : "Enviada"} · {x.channel}{x.template ? ` · ${x.template}` : ""}</span>
                    <span className="flex items-center gap-2 text-xs text-pedra-600"><Badge value={x.status} />{formatDateTime(x.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Presença">
            <p className="font-display text-3xl font-light text-grafite">{pct(presencas, totalAulas ?? 0)}%</p>
            <p className="text-sm text-pedra-600">{presencas} de {totalAulas ?? 0} aulas desde a aprovação</p>
            {(att ?? []).length > 0 && (
              <ul className="mt-4 divide-y divide-taupe-line text-sm">
                {(att ?? []).slice(0, 8).map((a, i) => {
                  const c = a.live_classes as unknown as { title: string; starts_at: string } | null;
                  return <li key={i} className="flex items-center justify-between gap-2 py-2"><span className="truncate text-grafite">{c?.title ?? "aula"}</span><Badge value={a.status} /></li>;
                })}
              </ul>
            )}
          </Card>

          <Card title="Enviar mensagem">
            {!integrations.whatsapp() && !integrations.resend() ? (
              <p className="text-sm text-pedra-600">Falta configuração. Conecte Resend ou Meta WhatsApp em Configurações.</p>
            ) : (
              <div className="space-y-5">
                {integrations.whatsapp() && (
                  <form action={sendMemberMessage} className="grid gap-3">
                    <input type="hidden" name="id" value={m.id} />
                    <p className="text-sm font-medium text-grafite">WhatsApp</p>
                    {!m.phone ? <p className="text-xs text-erro">Sem número cadastrado.</p> : !m.consent_whatsapp ? <p className="text-xs text-aviso">Sem consentimento registrado. Envie apenas mensagens de atendimento.</p> : null}
                    {inWindow ? (
                      <>
                        <input type="hidden" name="mode" value="whatsapp_text" />
                        <textarea name="body" rows={3} className="field" placeholder="Texto livre (janela de 24h aberta)" required />
                      </>
                    ) : (
                      <>
                        <input type="hidden" name="mode" value="whatsapp_template" />
                        <input name="template" className="field" defaultValue={env.waTplBoasVindas} aria-label="Nome do template" />
                        <input name="params" className="field" placeholder="Parâmetros separados por | (ex.: Maria | link)" aria-label="Parâmetros" />
                        <p className="text-xs text-pedra">Fora da janela de 24h só é possível enviar template aprovado na Meta.</p>
                      </>
                    )}
                    <button className="btn btn-sm btn-primary" disabled={!m.phone}>Enviar WhatsApp</button>
                  </form>
                )}
                {integrations.resend() && (
                  <form action={sendMemberMessage} className="grid gap-3 border-t border-taupe-line pt-5">
                    <input type="hidden" name="id" value={m.id} /><input type="hidden" name="mode" value="email" />
                    <p className="text-sm font-medium text-grafite">E-mail</p>
                    <input name="subject" className="field" placeholder="Assunto" required />
                    <textarea name="body" rows={3} className="field" placeholder="Mensagem" required />
                    <button className="btn btn-sm btn-outline">Enviar e-mail</button>
                  </form>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
