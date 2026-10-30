import crypto from "node:crypto";
import { env, integrations } from "@/lib/env";
import { normalizePhone } from "@/lib/utils";

export type WaResult = { ok: true; messageId: string } | { ok: false; error: string };

type TemplateArgs = {
  to: string;
  template: string;
  lang?: string;
  bodyParams?: string[];
  buttonUrlParam?: string; // sufixo dinâmico de botão de URL, se o template tiver
};

async function graph(path: string, body: unknown): Promise<WaResult> {
  if (!integrations.whatsapp()) return { ok: false, error: "Falta configuração: WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN" };
  try {
    const res = await fetch(`https://graph.facebook.com/${env.waVersion}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.waToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message: string; code?: number } };
    if (!res.ok) return { ok: false, error: data.error?.message || `Meta respondeu ${res.status}` };
    return { ok: true, messageId: data.messages?.[0]?.id ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha de rede ao chamar a Meta" };
  }
}

/** Mensagem de template (única forma de iniciar conversa fora da janela de 24h). */
export function sendTemplate({ to, template, lang = "pt_BR", bodyParams = [], buttonUrlParam }: TemplateArgs) {
  const components: unknown[] = [];
  if (bodyParams.length) components.push({ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) });
  if (buttonUrlParam) components.push({ type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: buttonUrlParam }] });
  return graph(`${env.waPhoneId}/messages`, {
    messaging_product: "whatsapp",
    to: normalizePhone(to),
    type: "template",
    template: { name: template, language: { code: lang }, components },
  });
}

/** Texto livre: só funciona dentro da janela de 24h após a última mensagem do contato. */
export function sendText(to: string, text: string) {
  return graph(`${env.waPhoneId}/messages`, {
    messaging_product: "whatsapp",
    to: normalizePhone(to),
    type: "text",
    text: { body: text, preview_url: false },
  });
}

/** Valida X-Hub-Signature-256 do webhook com o App Secret. */
export function verifySignature(rawBody: string, header: string | null) {
  if (!env.metaAppSecret || !header) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", env.metaAppSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export type InboundMessage = { from: string; id: string; timestamp: string; type: string; text?: string; raw: unknown };
export type StatusUpdate = { id: string; status: string; recipient: string; timestamp: string };

/** Extrai mensagens e status do payload do webhook. */
export function parseWebhook(payload: unknown): { messages: InboundMessage[]; statuses: StatusUpdate[]; phoneNumberId: string | null } {
  const messages: InboundMessage[] = [];
  const statuses: StatusUpdate[] = [];
  let phoneNumberId: string | null = null;
  const entries = (payload as { entry?: Array<{ changes?: Array<{ value?: Record<string, unknown> }> }> })?.entry ?? [];
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const v = change.value ?? {};
      const meta = v.metadata as { phone_number_id?: string } | undefined;
      if (meta?.phone_number_id) phoneNumberId = meta.phone_number_id;
      for (const m of (v.messages as Array<Record<string, unknown>> | undefined) ?? []) {
        messages.push({
          from: String(m.from ?? ""),
          id: String(m.id ?? ""),
          timestamp: String(m.timestamp ?? ""),
          type: String(m.type ?? ""),
          text: (m.text as { body?: string } | undefined)?.body,
          raw: m,
        });
      }
      for (const s of (v.statuses as Array<Record<string, unknown>> | undefined) ?? []) {
        statuses.push({ id: String(s.id ?? ""), status: String(s.status ?? ""), recipient: String(s.recipient_id ?? ""), timestamp: String(s.timestamp ?? "") });
      }
    }
  }
  return { messages, statuses, phoneNumberId };
}
