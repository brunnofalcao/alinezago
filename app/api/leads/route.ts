import { NextResponse, type NextRequest } from "next/server";
import { env, integrations } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, templates } from "@/lib/email";
import { normalizePhone } from "@/lib/utils";

const TYPES = new Set(["paciente", "palestra", "parceria", "outro"]);
const TYPE_LABEL: Record<string, string> = { paciente: "Paciente", palestra: "Palestra ou evento", parceria: "Parceria ou imprensa", outro: "Contato geral" };

// Rate limit simples por IP em memória (por instância). Para produção pesada, trocar por Upstash/KV.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1;
  return h.n > 5;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });

  let body: Record<string, string> = {};
  try { body = (await request.json()) as Record<string, string>; } catch { return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 }); }

  if (body.website) return NextResponse.json({ ok: true }); // honeypot: finge sucesso

  const name = (body.name || "").trim().slice(0, 120);
  const email = (body.email || "").trim().toLowerCase().slice(0, 160);
  const type = TYPES.has(body.type) ? body.type : "outro";
  const phone = body.phone ? normalizePhone(body.phone) : null;
  const company = (body.company || "").trim().slice(0, 160) || null;
  const message = (body.message || "").trim().slice(0, 4000) || null;
  const source = (body.source || "").trim().slice(0, 120) || null;

  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Informe nome e um e-mail válido." }, { status: 400 });
  }

  // 1) Persiste no banco (se configurado)
  let saved = false;
  if (integrations.supabaseAdmin()) {
    try {
      const db = createAdminClient();
      const { error } = await db.from("leads").insert({ type, name, email, phone, company, message, source });
      if (!error) saved = true;
    } catch { saved = false; }
  }

  // 2) Notifica a equipe e confirma ao remetente (se configurado)
  let notified = false;
  if (integrations.resend() && integrations.contact()) {
    const interno = templates.leadInterno(TYPE_LABEL[type], { Nome: name, "E-mail": email, WhatsApp: phone, Empresa: company, Origem: source, Mensagem: message });
    const r1 = await sendEmail({ to: env.contactTo, subject: interno.subject, html: interno.html, replyTo: email });
    const conf = templates.leadConfirmacao(name.split(" ")[0], type);
    await sendEmail({ to: email, subject: conf.subject, html: conf.html });
    notified = r1.ok;
  }

  if (!saved && !notified) {
    return NextResponse.json({ ok: false, error: "Falta configuração: o formulário ainda não está conectado (Supabase ou Resend)." }, { status: 503 });
  }
  return NextResponse.json({ ok: true, saved, notified });
}
