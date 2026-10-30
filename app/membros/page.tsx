import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card, Empty, Badge } from "@/components/app/Shell";
import { classState, formatDateTime } from "@/lib/utils";
import type { LiveClass, Announcement } from "@/lib/types";

export default async function MembrosHome() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const now = new Date();
  const [{ data: classes, error: e1 }, { data: ann, error: e2 }, { data: mine }] = await Promise.all([
    supabase.from("live_classes").select("*").eq("published", true).gte("starts_at", new Date(now.getTime() - 6 * 3600_000).toISOString()).order("starts_at").limit(5),
    supabase.from("announcements").select("*").order("published_at", { ascending: false }).limit(5),
    supabase.from("attendance").select("class_id, status").eq("profile_id", profile?.id ?? ""),
  ]);
  const list = (classes ?? []) as LiveClass[];
  const next = list.find((c) => classState(c.starts_at, c.duration_min, now) !== "encerrada");
  const presencas = (mine ?? []).filter((a) => a.status === "presente").length;
  const first = (profile?.full_name || "").split(" ")[0];

  return (
    <>
      <h1 className="text-d-3 font-light text-grafite">{first ? `Olá, ${first}.` : "Olá."}</h1>
      <p className="mt-2 text-pedra-600">Aqui ficam suas aulas ao vivo, as gravações e os avisos da equipe.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {e1 ? (
            <Card title="Próxima aula"><p className="text-sm text-erro">Não foi possível carregar este módulo.</p></Card>
          ) : next ? (
            <Card title="Próxima aula" action={<Badge value={classState(next.starts_at, next.duration_min, now)} />}>
              <p className="font-display text-2xl font-light text-grafite">{next.title}</p>
              <p className="mt-1 text-pedra-600">{formatDateTime(next.starts_at)} · {next.duration_min} min</p>
              {next.description && <p className="mt-4 max-w-prose text-sm text-pedra-600">{next.description}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                {classState(next.starts_at, next.duration_min, now) === "ao_vivo" ? (
                  <a href={`/membros/aulas/${next.id}/entrar`} className="btn btn-md btn-primary">Entrar na aula ao vivo</a>
                ) : (
                  <Link href={`/membros/aulas/${next.id}`} className="btn btn-md btn-outline">Ver detalhes</Link>
                )}
              </div>
              <p className="mt-4 text-xs text-pedra">A sala abre 30 minutos antes. Sua presença é registrada ao entrar.</p>
            </Card>
          ) : (
            <Card title="Próxima aula">
              <Empty title="Nenhuma aula agendada no momento." text="Quando a equipe marcar a próxima aula ao vivo, ela aparece aqui e você recebe um aviso por e-mail." />
            </Card>
          )}

          <Card title="Agenda" className="mt-6" action={<Link href="/membros/aulas" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Ver todas</Link>}>
            {list.length === 0 ? (
              <Empty title="Não há aulas publicadas ainda." />
            ) : (
              <ul className="divide-y divide-taupe-line">
                {list.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <Link href={`/membros/aulas/${c.id}`} className="font-medium text-grafite hover:underline">{c.title}</Link>
                      <p className="text-sm text-pedra-600">{formatDateTime(c.starts_at)}</p>
                    </div>
                    <Badge value={classState(c.starts_at, c.duration_min, now)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Sua constância">
            <p className="font-display text-3xl font-light text-grafite">{presencas}</p>
            <p className="text-sm text-pedra-600">{presencas === 1 ? "aula com presença registrada" : "aulas com presença registrada"}</p>
          </Card>
          <Card title="Avisos da equipe">
            {e2 ? (
              <p className="text-sm text-erro">Não foi possível carregar este módulo.</p>
            ) : (ann ?? []).length === 0 ? (
              <Empty title="Nenhum aviso por enquanto." />
            ) : (
              <ul className="space-y-4">
                {((ann ?? []) as Announcement[]).map((a) => (
                  <li key={a.id}>
                    <p className="font-medium text-grafite">{a.title}</p>
                    <p className="text-xs text-pedra">{formatDateTime(a.published_at)}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-pedra-600">{a.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
