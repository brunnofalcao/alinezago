import { NextResponse, type NextRequest } from "next/server";
import { env, integrations } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplate } from "@/lib/whatsapp";
import { sendEmail, templates } from "@/lib/email";
import { formatDateTime, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Roda a cada hora (vercel.json). Envia lembrete 24h antes e 1h antes da aula
 * para membros ativos, por e-mail e, com consentimento, por WhatsApp (template aprovado).
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!env.cronSecret || auth !== `Bearer ${env.cronSecret}`) return new NextResponse("Não autorizado", { status: 401 });
  if (!integrations.supabaseAdmin()) return NextResponse.json({ ok: false, error: "Falta configuração: Supabase" }, { status: 503 });

  const db = createAdminClient();
  const now = Date.now();
  const windows = [
    { kind: "24h", from: now + 23.5 * 3600_000, to: now + 24.5 * 3600_000 },
    { kind: "1h", from: now + 0.5 * 3600_000, to: now + 1.5 * 3600_000 },
  ];

  const { data: members } = await db.from("profiles").select("id, email, full_name, phone, consent_whatsapp").eq("status", "ativo");
  const report: Record<string, number> = {};

  for (const w of windows) {
    const { data: classes } = await db
      .from("live_classes")
      .select("id, title, starts_at")
      .eq("published", true)
      .gte("starts_at", new Date(w.from).toISOString())
      .lte("starts_at", new Date(w.to).toISOString());

    for (const c of classes ?? []) {
      const { data: already } = await db.from("class_notifications").select("id").eq("class_id", c.id).eq("kind", w.kind).maybeSingle();
      if (already) continue;

      const link = `${env.siteUrl}/membros/aulas/${c.id}`;
      const quando = w.kind === "1h" ? `hoje às ${formatTime(c.starts_at)}` : `amanhã, ${formatDateTime(c.starts_at)}`;
      let sent = 0;

      for (const m of members ?? []) {
        const nome = (m.full_name || "").split(" ")[0] || "olá";
        if (integrations.resend() && m.email) {
          const t = templates.lembreteAula(nome, c.title, quando, link);
          const r = await sendEmail({ to: m.email, subject: t.subject, html: t.html });
          await db.from("message_log").insert({ channel: "email", direction: "out", to_ref: m.email, profile_id: m.id, template: "lembrete_aula", status: r.ok ? "sent" : "failed", payload: r.ok ? { id: r.id } : { error: r.error } });
        }
        if (integrations.whatsapp() && m.consent_whatsapp && m.phone) {
          const r = await sendTemplate({ to: m.phone, template: env.waTplLembrete, bodyParams: [nome, c.title, quando, link] });
          await db.from("message_log").insert({ channel: "whatsapp", direction: "out", to_ref: m.phone, profile_id: m.id, template: env.waTplLembrete, status: r.ok ? "sent" : "failed", payload: r.ok ? {} : { error: r.error }, external_id: r.ok ? r.messageId : null });
        }
        sent += 1;
      }
      await db.from("class_notifications").insert({ class_id: c.id, kind: w.kind, recipients: sent });
      report[`${c.id}:${w.kind}`] = sent;
    }
  }
  return NextResponse.json({ ok: true, report });
}
