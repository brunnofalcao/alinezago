"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

export async function updateProfile(formData: FormData) {
  const { user } = await requireUser();
  const supabase = await createClient();
  const full_name = String(formData.get("full_name") || "").trim().slice(0, 120);
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const consent_whatsapp = formData.get("consent_whatsapp") === "on";
  const { error } = await supabase.from("profiles").update({ full_name, phone: phone || null, consent_whatsapp }).eq("id", user.id);
  revalidatePath("/membros/perfil");
  redirect(`/membros/perfil?${error ? "erro=" + encodeURIComponent("Não foi possível salvar. Tente novamente.") : "ok=1"}`);
}
