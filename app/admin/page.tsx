import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import { Stat, Card, Empty, Badge, Flash, ConfigNotice } from "@/components/app/Shell";
import { classState, formatDateTime, pct } from "@/lib/utils";
import type { LiveClass, Lead, Profile } from "@/lib/types";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const [ativos, pendentes, leadsNovos, { data: classes }, { data: pend }, { data: leads }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
    supabase.from("live_classes").select("*").order("starts_at", { ascending: false }).limit(8),
    supabase.from("profiles").select("*").eq("status", "pendente").order("created_at", { ascending: false }).limit(5),
    supabase.from("leads").select("*").eq("status", "novo").order("created_at", { ascending: false }).limit(5),
  ]);

  const all = (classes ?? []) as LiveClass[];
  const proxima = [...all].reverse().find((c) => classState(c.starts_at, c.duration_min, now) !== "encerrada");
  const ultima = all.find((c) => classState(c.starts_at, c.duration_min, now) === "encerrada");
  let taxa: string = "sem dados";
  if (ultima) {
    const { count } = await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("class_id", ultima.id).eq("status", "presente");
    taxa = `${pct(count ?? 0, ativos.count ?? 0)}%`;
  }
  const missing = [!integrations.resend() && "Resend", !integrations.whatsapp() && "Meta WhatsApp", !integrations.cron() && "Cron"].filter(Boolean) as string[];

  return (
    <>
      <h1 className="text-d-3 font-light text-grafite">Visão geral</h1>
      <p className="mt-2 text-pedra-600">Relacionamento com pacientes, aulas e presença em um só lugar.</p>
      <div className="mt-6"><Flash ok={sp.ok} erro={sp.erro} /></div>
      {missing.length > 0 && <div className="mb-6"><ConfigNotice text={`Integrações pendentes: ${missing.join(", ")}. O painel funciona, mas envios e lembretes ficam desativados até configurar.`} /></div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Membros ativos" value={ativos.count ?? 0} />
        <Stat label="Cadastros pendentes" value={pendentes.count ?? 0} hint="aguardando aprovação" />
        <Stat label="Presença na última aula" value={taxa} hint={ultima ? ultima.title : "nenhuma aula encerrada"} />
        <Stat label="Contatos novos" value={leadsNovos.count ?? 0} hint="site e mídia kit" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Próxima aula" action={<Link href="/admin/aulas" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Gerenciar</Link>}>
          {proxima ? (
            <>
              <p className="font-display text-xl text-grafite">{proxima.title}</p>
              <p className="text-sm text-pedra-600">{formatDateTime(proxima.starts_at)} · {proxima.duration_min} min</p>
              <div className="mt-3 flex items-center gap-3"><Badge value={classState(proxima.starts_at, proxima.duration_min, now)} />{!proxima.meeting_url && <span className="text-xs text-erro">sem link da sala</span>}</div>
              <Link href={`/admin/aulas/${proxima.id}`} className="btn btn-sm btn-outline mt-4">Abrir chamada</Link>
            </>
          ) : (
            <Empty title="Nenhuma aula agendada." action={<Link href="/admin/aulas" className="btn btn-sm btn-primary">Criar aula</Link>} />
          )}
        </Card>
        <Card title="Cadastros aguardando aprovação" action={<Link href="/admin/membros?status=pendente" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Ver todos</Link>}>
          {(pend ?? []).length === 0 ? <Empty title="Nenhum cadastro pendente." /> : (
            <ul className="divide-y divide-taupe-line">
              {((pend ?? []) as Profile[]).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0"><p className="truncate font-medium text-grafite">{p.full_name || p.email}</p><p className="truncate text-xs text-pedra-600">{p.email}</p></div>
                  <Link href={`/admin/membros/${p.id}`} className="btn btn-sm btn-outline shrink-0">Revisar</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Contatos novos" className="lg:col-span-2" action={<Link href="/admin/leads" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Ver todos</Link>}>
          {(leads ?? []).length === 0 ? <Empty title="Nenhum contato novo." /> : (
            <ul className="divide-y divide-taupe-line">
              {((leads ?? []) as Lead[]).map((l) => (
                <li key={l.id} className="grid gap-1 py-2.5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0"><p className="truncate font-medium text-grafite">{l.name} <span className="font-normal text-pedra-600">· {l.email}</span></p><p className="truncate text-xs text-pedra-600">{l.message ?? "sem mensagem"}</p></div>
                  <div className="flex items-center gap-2"><Badge value={l.type} /><span className="text-xs text-pedra">{formatDateTime(l.created_at)}</span></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
