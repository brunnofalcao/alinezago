import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageTitle, Card, Empty, Badge, Flash } from "@/components/app/Shell";
import { ClassForm } from "@/components/app/ClassForm";
import { classState, formatDateTime, pct } from "@/lib/utils";
import { createClass } from "../actions";
import type { LiveClass } from "@/lib/types";

export default async function AulasAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const [{ data, error }, { count: ativos }, { data: att }] = await Promise.all([
    supabase.from("live_classes").select("*").order("starts_at", { ascending: false }).limit(100),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("attendance").select("class_id, status"),
  ]);
  const rows = (data ?? []) as LiveClass[];
  const presentes = new Map<string, number>();
  for (const a of att ?? []) if (a.status === "presente") presentes.set(a.class_id, (presentes.get(a.class_id) ?? 0) + 1);

  return (
    <>
      <PageTitle title="Aulas e chamada" text="Agende as aulas ao vivo, publique gravações e faça a chamada." />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Nova aula" className="lg:col-span-1">
          <ClassForm action={createClass} submitLabel="Criar aula" />
        </Card>
        <Card title="Todas as aulas" className="lg:col-span-2 overflow-x-auto p-0">
          {error ? <p className="p-5 text-sm text-erro">Não foi possível carregar este módulo.</p> : rows.length === 0 ? (
            <div className="p-5"><Empty title="Nenhuma aula cadastrada." text="Crie a primeira aula ao lado. Os membros ativos passam a vê-la na comunidade e recebem lembretes automáticos." /></div>
          ) : (
            <table className="table-app w-full min-w-[640px]">
              <thead><tr><th>Aula</th><th>Quando</th><th>Status</th><th>Presença</th><th></th></tr></thead>
              <tbody>
                {rows.map((c) => {
                  const st = classState(c.starts_at, c.duration_min, now);
                  const p = presentes.get(c.id) ?? 0;
                  return (
                    <tr key={c.id}>
                      <td><Link href={`/admin/aulas/${c.id}`} className="font-medium text-grafite hover:underline">{c.title}</Link>{!c.published && <span className="badge ml-2 bg-pedra/15 text-pedra-600">oculta</span>}{!c.meeting_url && st !== "encerrada" && <span className="badge ml-2 bg-erro/10 text-erro">sem link</span>}</td>
                      <td className="text-pedra-600">{formatDateTime(c.starts_at)}</td>
                      <td><Badge value={st} /></td>
                      <td className="text-pedra-600">{st === "agendada" ? "" : `${p} de ${ativos ?? 0} (${pct(p, ativos ?? 0)}%)`}</td>
                      <td className="text-right"><Link href={`/admin/aulas/${c.id}`} className="btn btn-sm btn-outline">Chamada</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
