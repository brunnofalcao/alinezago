import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { classState } from "@/lib/utils";

/** Registra a presença (check-in) e redireciona para a sala. */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const back = (q: string) => NextResponse.redirect(new URL(`/membros/aulas/${id}?erro=${q}`, request.url));
  const { user, profile } = await getSessionProfile();
  if (!user) return NextResponse.redirect(new URL(`/entrar?next=/membros/aulas/${id}`, request.url));
  if (profile?.status !== "ativo" && profile?.role !== "admin") return NextResponse.redirect(new URL("/membros", request.url));

  const supabase = await createClient();
  const { data: c } = await supabase.from("live_classes").select("id, starts_at, duration_min, meeting_url").eq("id", id).maybeSingle();
  if (!c) return NextResponse.redirect(new URL("/membros/aulas", request.url));
  if (classState(c.starts_at, c.duration_min) !== "ao_vivo") return back("janela");
  if (!c.meeting_url) return back("link");

  // upsert sem sobrescrever status já marcado pela equipe
  const { data: existing } = await supabase.from("attendance").select("id").eq("class_id", id).eq("profile_id", user.id).maybeSingle();
  if (!existing) {
    await supabase.from("attendance").insert({ class_id: id, profile_id: user.id, status: "presente", source: "checkin" });
  }
  return NextResponse.redirect(c.meeting_url);
}
