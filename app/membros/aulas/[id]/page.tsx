import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card, Badge } from "@/components/app/Shell";
import { classState, formatDateTime } from "@/lib/utils";
import type { LiveClass, Attendance } from "@/lib/types";

function embedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default async function AulaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("live_classes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const c = data as LiveClass;
  const { data: att } = await supabase.from("attendance").select("*").eq("class_id", id).eq("profile_id", profile?.id ?? "").maybeSingle();
  const mine = att as Attendance | null;
  const state = classState(c.starts_at, c.duration_min);
  const embed = c.recording_url ? embedUrl(c.recording_url) : null;

  return (
    <>
      <Link href="/membros/aulas" className="text-sm text-taupe-deep underline-offset-4 hover:underline">Todas as aulas</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-d-3 font-light text-grafite">{c.title}</h1>
        <Badge value={state} />
      </div>
      <p className="mt-1 text-pedra-600">{formatDateTime(c.starts_at)} · {c.duration_min} min</p>
      {sp.erro === "janela" && <p className="mt-4 text-sm text-erro">A sala ainda não abriu. Ela fica disponível 30 minutos antes do horário.</p>}
      {sp.erro === "link" && <p className="mt-4 text-sm text-erro">O link da sala ainda não foi cadastrado pela equipe.</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {c.description && (
            <Card title="Sobre a aula"><p className="whitespace-pre-line text-pedra-600">{c.description}</p></Card>
          )}
          {state === "encerrada" && (
            <Card title="Gravação">
              {embed ? (
                <div className="aspect-video bg-grafite"><iframe className="h-full w-full" src={embed} title={`Gravação: ${c.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
              ) : c.recording_url ? (
                <a href={c.recording_url} target="_blank" rel="noreferrer" className="btn btn-md btn-outline">Abrir gravação</a>
              ) : (
                <p className="text-sm text-pedra-600">A gravação ainda não foi publicada. A equipe costuma disponibilizar em até 48 horas.</p>
              )}
            </Card>
          )}
          {c.material_url && (
            <Card title="Material de apoio"><a href={c.material_url} target="_blank" rel="noreferrer" className="btn btn-md btn-outline">Abrir material</a></Card>
          )}
        </div>
        <div className="space-y-6">
          <Card title="Sala ao vivo">
            {state === "ao_vivo" ? (
              <>
                <a href={`/membros/aulas/${c.id}/entrar`} className="btn btn-md btn-primary w-full">Entrar na aula ao vivo</a>
                <p className="mt-3 text-xs text-pedra">Ao entrar, sua presença é registrada automaticamente.</p>
              </>
            ) : state === "agendada" ? (
              <p className="text-sm text-pedra-600">A sala abre 30 minutos antes do horário. Volte aqui no dia da aula.</p>
            ) : (
              <p className="text-sm text-pedra-600">Esta aula já aconteceu.</p>
            )}
          </Card>
          <Card title="Sua presença">
            {mine ? (
              <div className="flex items-center gap-3"><Badge value={mine.status} /><span className="text-sm text-pedra-600">registrada em {formatDateTime(mine.checked_at)}</span></div>
            ) : (
              <p className="text-sm text-pedra-600">{state === "encerrada" ? "Sem registro de presença nesta aula." : "Ainda não registrada."}</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
