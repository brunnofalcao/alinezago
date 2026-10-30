import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageTitle, Card, Empty, Badge } from "@/components/app/Shell";
import { classState, formatDateTime } from "@/lib/utils";
import type { LiveClass } from "@/lib/types";

export default async function AulasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("live_classes").select("*").eq("published", true).order("starts_at", { ascending: false });
  const now = new Date();
  const all = (data ?? []) as LiveClass[];
  const proximas = all.filter((c) => classState(c.starts_at, c.duration_min, now) !== "encerrada").reverse();
  const passadas = all.filter((c) => classState(c.starts_at, c.duration_min, now) === "encerrada");

  const Item = ({ c }: { c: LiveClass }) => (
    <li className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href={`/membros/aulas/${c.id}`} className="font-display text-lg font-medium text-grafite hover:underline">{c.title}</Link>
        <p className="text-sm text-pedra-600">{formatDateTime(c.starts_at)} · {c.duration_min} min{c.recording_url ? " · gravação disponível" : ""}</p>
      </div>
      <Badge value={classState(c.starts_at, c.duration_min, now)} />
    </li>
  );

  return (
    <>
      <PageTitle title="Aulas" text="Aulas ao vivo e gravações da comunidade." />
      {error ? (
        <Card><p className="text-sm text-erro">Não foi possível carregar este módulo.</p></Card>
      ) : (
        <div className="grid gap-6">
          <Card title="Próximas">
            {proximas.length ? <ul className="divide-y divide-taupe-line">{proximas.map((c) => <Item key={c.id} c={c} />)}</ul> : <Empty title="Nenhuma aula agendada no momento." />}
          </Card>
          <Card title="Gravações e aulas anteriores">
            {passadas.length ? <ul className="divide-y divide-taupe-line">{passadas.map((c) => <Item key={c.id} c={c} />)}</ul> : <Empty title="Ainda não há aulas anteriores." />}
          </Card>
        </div>
      )}
    </>
  );
}
