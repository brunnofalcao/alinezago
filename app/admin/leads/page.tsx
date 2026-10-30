import { createClient } from "@/lib/supabase/server";
import { PageTitle, Card, Empty, Badge, Flash } from "@/components/app/Shell";
import { formatDateTime, whatsappLink } from "@/lib/utils";
import { setLeadStatus } from "../actions";
import type { Lead } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = { paciente: "Paciente", palestra: "Palestra", parceria: "Parceria", outro: "Geral" };

export default async function LeadsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; status?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (sp.status && ["novo", "contatado", "encerrado"].includes(sp.status)) q = q.eq("status", sp.status);
  const { data, error } = await q;
  return (
    <>
      <PageTitle title="Contatos do site" text="Formulários de contato, pedidos de proposta do mídia kit e parcerias." />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="mb-4 flex flex-wrap gap-2">
        {[["", "Todos"], ["novo", "Novos"], ["contatado", "Contatados"], ["encerrado", "Encerrados"]].map(([v, l]) => (
          <a key={v} href={`/admin/leads${v ? `?status=${v}` : ""}`} className={`btn btn-sm ${(sp.status ?? "") === v ? "btn-primary" : "btn-outline"}`}>{l}</a>
        ))}
      </div>
      <Card className="p-0">
        {error ? <p className="p-5 text-sm text-erro">Não foi possível carregar este módulo.</p> : (data ?? []).length === 0 ? <div className="p-5"><Empty title="Nenhum contato recebido." text="Os formulários do site e do mídia kit gravam aqui quando o Supabase está configurado." /></div> : (
          <ul className="divide-y divide-taupe-line">
            {((data ?? []) as Lead[]).map((l) => (
              <li key={l.id} className="grid gap-3 p-5 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-grafite">{l.name}</p><span className="badge bg-taupe/30 text-taupe-deep">{TYPE_LABEL[l.type]}</span><Badge value={l.status} /><span className="text-xs text-pedra">{formatDateTime(l.created_at)}{l.source ? ` · ${l.source}` : ""}</span></div>
                  <p className="mt-1 text-sm text-pedra-600">{l.email}{l.phone ? ` · +${l.phone}` : ""}{l.company ? ` · ${l.company}` : ""}</p>
                  {l.message && <p className="mt-2 whitespace-pre-line text-sm text-grafite">{l.message}</p>}
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <a href={`mailto:${l.email}`} className="btn btn-sm btn-outline">Responder por e-mail</a>
                  {l.phone && <a href={whatsappLink(l.phone)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">WhatsApp</a>}
                  {l.status !== "contatado" && <form action={setLeadStatus}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="contatado" /><button className="btn btn-sm btn-ghost">Marcar contatado</button></form>}
                  {l.status !== "encerrado" && <form action={setLeadStatus}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="encerrado" /><button className="btn btn-sm btn-ghost">Encerrar</button></form>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
