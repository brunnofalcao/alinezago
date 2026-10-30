import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageTitle, Card, Empty, Badge, Flash } from "@/components/app/Shell";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default async function MembrosAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("profiles").select("*").order("status").order("created_at", { ascending: false }).limit(300);
  if (sp.status && ["pendente", "ativo", "inativo"].includes(sp.status)) q = q.eq("status", sp.status);
  if (sp.q) q = q.or(`full_name.ilike.%${sp.q}%,email.ilike.%${sp.q}%,phone.ilike.%${sp.q}%`);
  const { data, error } = await q;
  const rows = (data ?? []) as Profile[];

  const filters = [["", "Todos"], ["pendente", "Pendentes"], ["ativo", "Ativos"], ["inativo", "Inativos"]];

  return (
    <>
      <PageTitle title="Membros" text="Pacientes cadastrados na comunidade. Aprove, acompanhe e registre o relacionamento." />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(([v, l]) => (
            <Link key={v} href={`/admin/membros${v ? `?status=${v}` : ""}`} className={`btn btn-sm ${(sp.status ?? "") === v ? "btn-primary" : "btn-outline"}`}>{l}</Link>
          ))}
        </div>
        <form className="flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Buscar nome, e-mail ou WhatsApp" className="field sm:w-72" />
          <button className="btn btn-md btn-outline">Buscar</button>
        </form>
      </div>
      <Card className="overflow-x-auto p-0">
        {error ? (
          <p className="p-5 text-sm text-erro">Não foi possível carregar este módulo.</p>
        ) : rows.length === 0 ? (
          <div className="p-5"><Empty title="Nenhum membro encontrado." text="Os cadastros feitos em /cadastro aparecem aqui como pendentes." /></div>
        ) : (
          <table className="table-app w-full min-w-[760px]">
            <thead><tr><th>Nome</th><th>Contato</th><th>Status</th><th>Tags</th><th>Cadastro</th><th></th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/admin/membros/${p.id}`} className="font-medium text-grafite hover:underline">{p.full_name || "(sem nome)"}</Link>{p.role === "admin" && <span className="badge ml-2 bg-grafite text-marfim">admin</span>}</td>
                  <td><p>{p.email}</p><p className="text-xs text-pedra-600">{p.phone ? `+${p.phone}` : "sem WhatsApp"}{p.consent_whatsapp ? "" : p.phone ? " · sem consentimento" : ""}</p></td>
                  <td><Badge value={p.status} /></td>
                  <td className="text-xs text-pedra-600">{p.tags.join(", ") || ""}</td>
                  <td className="text-pedra-600">{formatDate(p.created_at)}</td>
                  <td className="text-right"><Link href={`/admin/membros/${p.id}`} className="btn btn-sm btn-outline">Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
