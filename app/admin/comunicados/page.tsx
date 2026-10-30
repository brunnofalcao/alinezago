import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import { PageTitle, Card, Empty, Flash } from "@/components/app/Shell";
import { formatDateTime } from "@/lib/utils";
import { createAnnouncement, deleteAnnouncement } from "../actions";
import type { Announcement } from "@/lib/types";

export default async function ComunicadosAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from("announcements").select("*").order("published_at", { ascending: false }).limit(50);
  return (
    <>
      <PageTitle title="Comunicados" text="Avisos publicados na comunidade. Opcionalmente, envie também por e-mail para os membros ativos." />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Novo comunicado">
          <form action={createAnnouncement} className="grid gap-4">
            <div><label className="label" htmlFor="title">Título</label><input id="title" name="title" className="field" required /></div>
            <div><label className="label" htmlFor="body">Texto</label><textarea id="body" name="body" rows={6} className="field" required /></div>
            <label className="flex items-center gap-3 text-sm text-grafite"><input type="checkbox" name="notify_email" className="h-4 w-4 accent-taupe-deep" disabled={!integrations.resend()} /> Enviar por e-mail aos membros ativos{!integrations.resend() && <span className="text-xs text-aviso">(falta configuração: Resend)</span>}</label>
            <div><button className="btn btn-md btn-primary">Publicar</button></div>
          </form>
        </Card>
        <Card title="Publicados" className="lg:col-span-2">
          {error ? <p className="text-sm text-erro">Não foi possível carregar este módulo.</p> : (data ?? []).length === 0 ? <Empty title="Nenhum comunicado publicado." /> : (
            <ul className="divide-y divide-taupe-line">
              {((data ?? []) as Announcement[]).map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-4">
                  <div><p className="font-medium text-grafite">{a.title}</p><p className="text-xs text-pedra">{formatDateTime(a.published_at)}</p><p className="mt-1 whitespace-pre-line text-sm text-pedra-600">{a.body}</p></div>
                  <form action={deleteAnnouncement}><input type="hidden" name="id" value={a.id} /><button className="btn btn-sm btn-ghost text-erro">Remover</button></form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
