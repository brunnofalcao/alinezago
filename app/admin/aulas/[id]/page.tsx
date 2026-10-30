import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Empty, Badge, Flash } from "@/components/app/Shell";
import { ClassForm } from "@/components/app/ClassForm";
import { classState, formatDateTime, pct } from "@/lib/utils";
import { updateClass, deleteClass, setAttendance, markAbsentRemaining } from "../../actions";
import type { LiveClass, Profile, Attendance } from "@/lib/types";

export default async function AulaAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("live_classes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const c = data as LiveClass;
  const [{ data: members }, { data: att }] = await Promise.all([
    supabase.from("profiles").select("*").eq("status", "ativo").order("full_name"),
    supabase.from("attendance").select("*").eq("class_id", id),
  ]);
  const list = (members ?? []) as Profile[];
  const byMember = new Map(((att ?? []) as Attendance[]).map((a) => [a.profile_id, a]));
  const presentes = (att ?? []).filter((a) => a.status === "presente").length;
  const state = classState(c.starts_at, c.duration_min);
  const statuses: Array<["presente" | "ausente" | "justificada", string]> = [["presente", "P"], ["ausente", "A"], ["justificada", "J"]];

  return (
    <>
      <Link href="/admin/aulas" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Aulas</Link>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3"><h1 className="text-d-3 font-light text-grafite">{c.title}</h1><Badge value={state} /></div>
        <div className="flex gap-2">
          <a href={`/api/admin/aulas/${c.id}/export`} className="btn btn-sm btn-outline">Exportar chamada (CSV)</a>
          <form action={deleteClass}><input type="hidden" name="id" value={c.id} /><button className="btn btn-sm btn-danger">Excluir aula</button></form>
        </div>
      </div>
      <p className="mt-1 text-pedra-600">{formatDateTime(c.starts_at)} · {c.duration_min} min</p>
      <div className="mt-6"><Flash ok={sp.ok} erro={sp.erro} /></div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Dados da aula" className="lg:col-span-2">
          <ClassForm action={updateClass} cls={c} submitLabel="Salvar alterações" />
        </Card>

        <Card title="Chamada" className="lg:col-span-3 p-0" action={<span className="text-sm text-pedra-600">{presentes} presentes de {list.length} ({pct(presentes, list.length)}%)</span>}>
          <div id="chamada" />
          {list.length === 0 ? (
            <div className="p-5"><Empty title="Nenhum membro ativo." text="Aprove os cadastros pendentes em Membros para montar a lista de chamada." /></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-taupe-line px-5 py-3 text-xs text-pedra-600">
                <span>P = presente · A = ausente · J = justificada. Check-ins automáticos aparecem marcados.</span>
                {state === "encerrada" && (
                  <form action={markAbsentRemaining}><input type="hidden" name="class_id" value={c.id} /><button className="btn btn-sm btn-outline">Marcar ausentes restantes</button></form>
                )}
              </div>
              <ul className="divide-y divide-taupe-line">
                {list.map((m) => {
                  const a = byMember.get(m.id);
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <div className="min-w-0">
                        <Link href={`/admin/membros/${m.id}`} className="block truncate text-sm font-medium text-grafite hover:underline">{m.full_name || m.email}</Link>
                        <p className="text-xs text-pedra-600">{a ? `${a.source === "checkin" ? "check-in" : "marcado"} · ${formatDateTime(a.checked_at)}` : "sem registro"}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {statuses.map(([s, l]) => (
                          <form key={s} action={setAttendance}>
                            <input type="hidden" name="class_id" value={c.id} /><input type="hidden" name="profile_id" value={m.id} /><input type="hidden" name="status" value={s} />
                            <button className={`h-8 w-8 border text-xs font-semibold ${a?.status === s ? (s === "presente" ? "border-ok bg-ok text-white" : s === "ausente" ? "border-erro bg-erro text-white" : "border-aviso bg-aviso text-white") : "border-taupe-line bg-white text-pedra-600 hover:border-grafite"}`} aria-label={`Marcar ${s} para ${m.full_name || m.email}`} aria-pressed={a?.status === s}>{l}</button>
                          </form>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
