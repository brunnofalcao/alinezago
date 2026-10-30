"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { env, integrations } from "@/lib/env";
import { sendEmail, templates } from "@/lib/email";
import { sendTemplate, sendText } from "@/lib/whatsapp";
import { normalizePhone } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const ERR = (m: string) => `erro=${encodeURIComponent(m)}`;
const OK = (m: string) => `ok=${encodeURIComponent(m)}`;

async function guard() {
  const s = await getSessionProfile();
  if (!s.user || s.profile?.role !== "admin") redirect(`/admin?${ERR("Você não tem permissão para acessar esta área.")}`);
  return { supabase: await createClient(), admin: s.profile as Profile };
}

function str(fd: FormData, k: string, max = 2000) {
  return String(fd.get(k) ?? "").trim().slice(0, max);
}

/** Converte "2026-11-05T19:00" (datetime-local) para ISO assumindo horário de Brasília (-03:00). */
function brasiliaToIso(local: string) {
  if (!local) return null;
  const d = new Date(`${local}:00-03:00`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function log(supabase: Awaited<ReturnType<typeof createClient>>, row: Record<string, unknown>) {
  await supabase.from("message_log").insert(row);
}

// ---------------- Membros ----------------
export async function setMemberStatus(fd: FormData) {
  const { supabase } = await guard();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!["pendente", "ativo", "inativo"].includes(status)) redirect(`/admin/membros/${id}?${ERR("Status inválido.")}`);

  const { data: before } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const patch: Record<string, unknown> = { status };
  if (status === "ativo" && before?.status !== "ativo") patch.approved_at = new Date().toISOString();
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  let msg = error ? "" : "Status atualizado.";

  if (!error && status === "ativo" && before && before.status !== "ativo") {
    const nome = (before.full_name || "").split(" ")[0] || "olá";
    if (integrations.resend()) {
      const t = templates.acessoLiberado(nome);
      const r = await sendEmail({ to: before.email, subject: t.subject, html: t.html });
      await log(supabase, { channel: "email", direction: "out", to_ref: before.email, profile_id: id, template: "acesso_liberado", status: r.ok ? "sent" : "failed", payload: r.ok ? { id: r.id } : { error: r.error } });
      msg += r.ok ? " E-mail de boas-vindas enviado." : " E-mail não enviado: " + r.error;
    }
    if (integrations.whatsapp() && before.consent_whatsapp && before.phone) {
      const r = await sendTemplate({ to: before.phone, template: env.waTplBoasVindas, bodyParams: [nome, `${env.siteUrl}/membros`] });
      await log(supabase, { channel: "whatsapp", direction: "out", to_ref: before.phone, profile_id: id, template: env.waTplBoasVindas, status: r.ok ? "sent" : "failed", payload: r.ok ? {} : { error: r.error }, external_id: r.ok ? r.messageId : null });
      msg += r.ok ? " WhatsApp de boas-vindas enviado." : " WhatsApp não enviado: " + r.error;
    }
  }
  revalidatePath("/admin/membros");
  redirect(`/admin/membros/${id}?${error ? ERR("Não foi possível atualizar: " + error.message) : OK(msg)}`);
}

export async function updateMemberNotes(fd: FormData) {
  const { supabase } = await guard();
  const id = str(fd, "id");
  const tags = str(fd, "tags").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
  const phone = normalizePhone(str(fd, "phone", 30));
  const { error } = await supabase.from("profiles").update({ notes: str(fd, "notes", 4000) || null, tags, phone: phone || null, full_name: str(fd, "full_name", 120) || null }).eq("id", id);
  revalidatePath(`/admin/membros/${id}`);
  redirect(`/admin/membros/${id}?${error ? ERR(error.message) : OK("Dados salvos.")}`);
}

export async function addInteraction(fd: FormData) {
  const { supabase, admin } = await guard();
  const id = str(fd, "id");
  const kind = str(fd, "kind");
  const content = str(fd, "content", 4000);
  if (!content) redirect(`/admin/membros/${id}?${ERR("Escreva o conteúdo da interação.")}`);
  const { error } = await supabase.from("interactions").insert({ profile_id: id, kind, content, created_by: admin.id });
  revalidatePath(`/admin/membros/${id}`);
  redirect(`/admin/membros/${id}?${error ? ERR(error.message) : OK("Interação registrada.")}`);
}

export async function sendMemberMessage(fd: FormData) {
  const { supabase } = await guard();
  const id = str(fd, "id");
  const mode = str(fd, "mode"); // whatsapp_template | whatsapp_text | email
  const { data: m } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!m) redirect(`/admin/membros?${ERR("Membro não encontrado.")}`);
  const member = m as Profile;
  let msg = "";

  if (mode === "email") {
    if (!integrations.resend()) msg = "Falta configuração: Resend.";
    else {
      const t = templates.comunicado(str(fd, "subject", 200) || "Mensagem da equipe", str(fd, "body", 5000));
      const r = await sendEmail({ to: member.email, subject: t.subject, html: t.html });
      await log(supabase, { channel: "email", direction: "out", to_ref: member.email, profile_id: id, template: "mensagem_individual", status: r.ok ? "sent" : "failed", payload: r.ok ? { id: r.id } : { error: r.error } });
      msg = r.ok ? "E-mail enviado." : "E-mail não enviado: " + r.error;
    }
  } else {
    if (!integrations.whatsapp()) msg = "Falta configuração: Meta WhatsApp.";
    else if (!member.phone) msg = "Este membro não tem WhatsApp cadastrado.";
    else if (mode === "whatsapp_text") {
      const inWindow = member.last_inbound_at && Date.now() - new Date(member.last_inbound_at).getTime() < 24 * 3600_000;
      if (!inWindow) msg = "Fora da janela de 24h: só é possível enviar texto livre após o paciente mandar mensagem. Use um template.";
      else {
        const r = await sendText(member.phone, str(fd, "body", 4000));
        await log(supabase, { channel: "whatsapp", direction: "out", to_ref: member.phone, profile_id: id, template: null, status: r.ok ? "sent" : "failed", payload: r.ok ? {} : { error: r.error }, external_id: r.ok ? r.messageId : null });
        msg = r.ok ? "WhatsApp enviado." : "WhatsApp não enviado: " + r.error;
      }
    } else {
      const template = str(fd, "template", 120) || env.waTplBoasVindas;
      const params = str(fd, "params", 1000).split("|").map((p) => p.trim()).filter(Boolean);
      const r = await sendTemplate({ to: member.phone, template, bodyParams: params });
      await log(supabase, { channel: "whatsapp", direction: "out", to_ref: member.phone, profile_id: id, template, status: r.ok ? "sent" : "failed", payload: r.ok ? {} : { error: r.error }, external_id: r.ok ? r.messageId : null });
      msg = r.ok ? "Template enviado." : "Template não enviado: " + r.error;
    }
  }
  revalidatePath(`/admin/membros/${id}`);
  redirect(`/admin/membros/${id}?${msg.startsWith("Falta") || msg.includes("não enviado") || msg.startsWith("Fora") || msg.startsWith("Este") ? ERR(msg) : OK(msg)}`);
}

// ---------------- Aulas ----------------
function classPayload(fd: FormData) {
  const starts_at = brasiliaToIso(str(fd, "starts_at", 30));
  return {
    title: str(fd, "title", 160),
    description: str(fd, "description", 4000) || null,
    starts_at,
    duration_min: Math.min(600, Math.max(10, Number(str(fd, "duration_min", 5)) || 60)),
    meeting_url: str(fd, "meeting_url", 500) || null,
    recording_url: str(fd, "recording_url", 500) || null,
    material_url: str(fd, "material_url", 500) || null,
    published: fd.get("published") === "on",
  };
}

export async function createClass(fd: FormData) {
  const { supabase, admin } = await guard();
  const p = classPayload(fd);
  if (!p.title || !p.starts_at) redirect(`/admin/aulas?${ERR("Informe título e data/hora.")}`);
  const { data, error } = await supabase.from("live_classes").insert({ ...p, created_by: admin.id }).select("id").single();
  revalidatePath("/admin/aulas");
  if (error || !data) redirect(`/admin/aulas?${ERR(error?.message ?? "Não foi possível criar a aula.")}`);
  redirect(`/admin/aulas/${data.id}?${OK("Aula criada.")}`);
}

export async function updateClass(fd: FormData) {
  const { supabase } = await guard();
  const id = str(fd, "id");
  const p = classPayload(fd);
  if (!p.title || !p.starts_at) redirect(`/admin/aulas/${id}?${ERR("Informe título e data/hora.")}`);
  const { error } = await supabase.from("live_classes").update(p).eq("id", id);
  revalidatePath(`/admin/aulas/${id}`);
  redirect(`/admin/aulas/${id}?${error ? ERR(error.message) : OK("Aula atualizada.")}`);
}

export async function deleteClass(fd: FormData) {
  const { supabase } = await guard();
  const id = str(fd, "id");
  const { error } = await supabase.from("live_classes").delete().eq("id", id);
  revalidatePath("/admin/aulas");
  redirect(`/admin/aulas?${error ? ERR(error.message) : OK("Aula excluída.")}`);
}

export async function setAttendance(fd: FormData) {
  const { supabase } = await guard();
  const class_id = str(fd, "class_id");
  const profile_id = str(fd, "profile_id");
  const status = str(fd, "status");
  if (!["presente", "ausente", "justificada"].includes(status)) redirect(`/admin/aulas/${class_id}?${ERR("Status inválido.")}`);
  const { error } = await supabase.from("attendance").upsert({ class_id, profile_id, status, source: "admin", checked_at: new Date().toISOString() }, { onConflict: "class_id,profile_id" });
  revalidatePath(`/admin/aulas/${class_id}`);
  redirect(`/admin/aulas/${class_id}${error ? "?" + ERR(error.message) : ""}#chamada`);
}

export async function markAbsentRemaining(fd: FormData) {
  const { supabase } = await guard();
  const class_id = str(fd, "class_id");
  const [{ data: members }, { data: att }] = await Promise.all([
    supabase.from("profiles").select("id").eq("status", "ativo"),
    supabase.from("attendance").select("profile_id").eq("class_id", class_id),
  ]);
  const has = new Set((att ?? []).map((a) => a.profile_id));
  const rows = (members ?? []).filter((m) => !has.has(m.id)).map((m) => ({ class_id, profile_id: m.id, status: "ausente", source: "admin" }));
  let error: string | null = null;
  if (rows.length) { const r = await supabase.from("attendance").insert(rows); error = r.error?.message ?? null; }
  revalidatePath(`/admin/aulas/${class_id}`);
  redirect(`/admin/aulas/${class_id}?${error ? ERR(error) : OK(`${rows.length} ausências registradas.`)}#chamada`);
}

// ---------------- Comunicados ----------------
export async function createAnnouncement(fd: FormData) {
  const { supabase, admin } = await guard();
  const title = str(fd, "title", 160);
  const body = str(fd, "body", 5000);
  if (!title || !body) redirect(`/admin/comunicados?${ERR("Informe título e texto.")}`);
  const { error } = await supabase.from("announcements").insert({ title, body, created_by: admin.id });
  if (error) redirect(`/admin/comunicados?${ERR(error.message)}`);

  let extra = "";
  if (fd.get("notify_email") === "on") {
    if (!integrations.resend()) extra += " E-mail não enviado: falta configuração.";
    else {
      const { data: members } = await supabase.from("profiles").select("id, email").eq("status", "ativo");
      const t = templates.comunicado(title, body);
      let n = 0;
      for (const m of members ?? []) {
        const r = await sendEmail({ to: m.email, subject: t.subject, html: t.html });
        await log(supabase, { channel: "email", direction: "out", to_ref: m.email, profile_id: m.id, template: "comunicado", status: r.ok ? "sent" : "failed", payload: r.ok ? { id: r.id } : { error: r.error } });
        if (r.ok) n++;
      }
      extra += ` E-mail enviado para ${n} membros.`;
    }
  }
  revalidatePath("/admin/comunicados");
  redirect(`/admin/comunicados?${OK("Comunicado publicado." + extra)}`);
}

export async function deleteAnnouncement(fd: FormData) {
  const { supabase } = await guard();
  const { error } = await supabase.from("announcements").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/comunicados");
  redirect(`/admin/comunicados?${error ? ERR(error.message) : OK("Comunicado removido.")}`);
}

// ---------------- Disparos ----------------
export async function broadcast(fd: FormData) {
  const { supabase } = await guard();
  const audience = str(fd, "audience"); // ativos | pendentes | todos
  const channel = str(fd, "channel"); // whatsapp | email
  let q = supabase.from("profiles").select("id, email, phone, full_name, consent_whatsapp");
  if (audience === "ativos") q = q.eq("status", "ativo");
  if (audience === "pendentes") q = q.eq("status", "pendente");
  const { data: members } = await q;
  let sent = 0, skipped = 0, failed = 0;

  if (channel === "email") {
    if (!integrations.resend()) redirect(`/admin/mensagens?${ERR("Falta configuração: Resend.")}`);
    const t = templates.comunicado(str(fd, "subject", 200) || "Mensagem da equipe", str(fd, "body", 5000));
    for (const m of members ?? []) {
      const r = await sendEmail({ to: m.email, subject: t.subject, html: t.html });
      await log(supabase, { channel: "email", direction: "out", to_ref: m.email, profile_id: m.id, template: "disparo_email", status: r.ok ? "sent" : "failed", payload: r.ok ? { id: r.id } : { error: r.error } });
      r.ok ? sent++ : failed++;
    }
  } else {
    if (!integrations.whatsapp()) redirect(`/admin/mensagens?${ERR("Falta configuração: Meta WhatsApp.")}`);
    const template = str(fd, "template", 120);
    const paramsRaw = str(fd, "params", 1000);
    if (!template) redirect(`/admin/mensagens?${ERR("Informe o nome do template aprovado.")}`);
    for (const m of members ?? []) {
      if (!m.phone || !m.consent_whatsapp) { skipped++; continue; }
      const nome = (m.full_name || "").split(" ")[0] || "olá";
      const params = paramsRaw.split("|").map((p) => p.trim().replace("{nome}", nome)).filter(Boolean);
      const r = await sendTemplate({ to: m.phone, template, bodyParams: params });
      await log(supabase, { channel: "whatsapp", direction: "out", to_ref: m.phone, profile_id: m.id, template, status: r.ok ? "sent" : "failed", payload: r.ok ? {} : { error: r.error }, external_id: r.ok ? r.messageId : null });
      r.ok ? sent++ : failed++;
    }
  }
  revalidatePath("/admin/mensagens");
  redirect(`/admin/mensagens?${OK(`Disparo concluído: ${sent} enviadas, ${failed} com falha, ${skipped} ignoradas (sem WhatsApp ou sem consentimento).`)}`);
}

// ---------------- Leads ----------------
export async function setLeadStatus(fd: FormData) {
  const { supabase } = await guard();
  const status = str(fd, "status");
  if (!["novo", "contatado", "encerrado"].includes(status)) redirect(`/admin/leads?${ERR("Status inválido.")}`);
  const { error } = await supabase.from("leads").update({ status }).eq("id", str(fd, "id"));
  revalidatePath("/admin/leads");
  redirect(`/admin/leads${error ? "?" + ERR(error.message) : ""}`);
}
