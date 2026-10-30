import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSessionProfile(): Promise<{ user: { id: string; email: string } | null; profile: Profile | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user: { id: user.id, email: user.email ?? "" }, profile: (profile as Profile | null) ?? null };
}

/** Garante usuário logado. Redireciona para /entrar se não houver sessão. */
export async function requireUser() {
  const s = await getSessionProfile();
  if (!s.user) redirect("/entrar");
  return s as { user: { id: string; email: string }; profile: Profile | null };
}

/** Garante admin. Lança erro (Server Actions) em vez de redirecionar. */
export async function requireAdmin() {
  const s = await getSessionProfile();
  if (!s.user || s.profile?.role !== "admin") {
    throw new Error("Você não tem permissão para acessar esta área.");
  }
  return s as { user: { id: string; email: string }; profile: Profile };
}
