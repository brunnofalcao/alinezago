import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await getSessionProfile();
  if (!s.user || s.profile?.role !== "admin") return new NextResponse("Você não tem permissão para acessar esta área.", { status: 403 });

  const supabase = await createClient();
  const { data: cls } = await supabase.from("live_classes").select("title, starts_at").eq("id", id).maybeSingle();
  const { data: members } = await supabase.from("profiles").select("id, full_name, email, phone").eq("status", "ativo").order("full_name");
  const { data: att } = await supabase.from("attendance").select("profile_id, status, source, checked_at").eq("class_id", id);
  const map = new Map((att ?? []).map((a) => [a.profile_id, a]));

  const rows = [["Nome", "E-mail", "WhatsApp", "Presença", "Origem", "Registrado em"]];
  for (const m of members ?? []) {
    const a = map.get(m.id);
    rows.push([m.full_name ?? "", m.email ?? "", m.phone ?? "", a?.status ?? "sem registro", a?.source ?? "", a ? formatDateTime(a.checked_at) : ""]);
  }
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const name = `chamada-${(cls?.title ?? "aula").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(cls?.starts_at ?? "").slice(0, 10)}.csv`;
  return new NextResponse("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` } });
}
