import { NextResponse, type NextRequest } from "next/server";
import { env, integrations } from "@/lib/env";
import { parseWebhook, verifySignature } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/admin";

/** Verificação do webhook (Meta chama GET uma vez ao cadastrar a URL). */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  if (sp.get("hub.mode") === "subscribe" && sp.get("hub.verify_token") === env.waVerifyToken && env.waVerifyToken) {
    return new NextResponse(sp.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Token inválido", { status: 403 });
}

/** Recebe mensagens e status. Sempre responde 200 rápido; processamento é leve. */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Assinatura inválida", { status: 401 });
  }
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return new NextResponse("JSON inválido", { status: 400 }); }

  const { messages, statuses } = parseWebhook(payload);
  if (!integrations.supabaseAdmin()) return NextResponse.json({ ok: true, stored: false });

  const db = createAdminClient();
  const nowIso = new Date().toISOString();

  for (const m of messages) {
    const { data: profile } = await db.from("profiles").select("id").eq("phone", m.from).maybeSingle();
    await db.from("message_log").insert({
      channel: "whatsapp", direction: "in", to_ref: m.from, profile_id: profile?.id ?? null,
      template: null, status: m.type, payload: m.raw, external_id: m.id,
    });
    if (profile?.id) await db.from("profiles").update({ last_inbound_at: nowIso }).eq("id", profile.id);
  }
  for (const s of statuses) {
    await db.from("message_log").update({ status: s.status }).eq("external_id", s.id);
  }
  return NextResponse.json({ ok: true, messages: messages.length, statuses: statuses.length });
}
