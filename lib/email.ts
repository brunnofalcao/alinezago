import { env, integrations } from "@/lib/env";
import { site } from "@/content/site";

type SendArgs = { to: string | string[]; subject: string; html: string; replyTo?: string };

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

/** Envio via API REST do Resend (sem SDK, menos dependência). */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<SendResult> {
  if (!integrations.resend()) return { ok: false, error: "Falta configuração: RESEND_API_KEY e EMAIL_FROM" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.emailFrom, to: Array.isArray(to) ? to : [to], subject, html, reply_to: replyTo }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return { ok: false, error: data.message || `Resend respondeu ${res.status}` };
    return { ok: true, id: data.id ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha de rede ao enviar e-mail" };
  }
}

function layout(title: string, body: string) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F6F2ED;font-family:Inter,Helvetica,Arial,sans-serif;color:#2B2825">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F2ED;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #D8CFC3">
        <tr><td style="padding:28px 32px 8px;font-family:Raleway,Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.14em;color:#7A6A58">${site.name.toUpperCase()}</td></tr>
        <tr><td style="padding:0 32px 8px;font-family:Raleway,Helvetica,Arial,sans-serif;font-size:24px;line-height:1.25;color:#2B2825">${title}</td></tr>
        <tr><td style="padding:8px 32px 28px;font-size:16px;line-height:1.6;color:#524F4F">${body}</td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #D8CFC3;font-size:12px;line-height:1.5;color:#8A8580">${site.name}, ${site.crm}. Atendimento online para todo o Brasil e presencial em Brasília.<br>Este e-mail foi enviado porque você se cadastrou em ${env.siteUrl}.</td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#7A6A58;color:#FBF7F1;text-decoration:none;padding:14px 24px;font-family:Raleway,Helvetica,Arial,sans-serif;font-weight:600">${label}</a></p>`;

export const templates = {
  cadastroRecebido(nome: string) {
    return {
      subject: "Recebemos seu cadastro na comunidade",
      html: layout(
        `Olá, ${nome}.`,
        `<p>Seu cadastro na comunidade da Dra. Aline Zago foi recebido. A equipe confere os dados e libera o acesso em até 2 dias úteis. Você receberá um e-mail assim que estiver tudo pronto.</p>
         <p>Enquanto isso, se tiver dúvidas, fale com a equipe pelo WhatsApp: ${site.whatsappDisplay}.</p>`,
      ),
    };
  },
  acessoLiberado(nome: string) {
    return {
      subject: "Seu acesso à comunidade está liberado",
      html: layout(
        `Bem-vinda(o), ${nome}.`,
        `<p>Seu acesso à comunidade foi aprovado. Lá você encontra as aulas ao vivo, as gravações e os avisos da equipe.</p>
         ${button(`${env.siteUrl}/membros`, "Entrar na comunidade")}
         <p>O login é feito com o seu e-mail, sem senha: você recebe um link de acesso a cada entrada.</p>`,
      ),
    };
  },
  lembreteAula(nome: string, aula: string, quando: string, link: string) {
    return {
      subject: `Hoje: ${aula}`,
      html: layout(
        `${nome}, sua aula ao vivo é ${quando}.`,
        `<p><strong>${aula}</strong></p>
         <p>Entre pela comunidade para registrar sua presença e abrir a sala.</p>
         ${button(link, "Entrar na aula")}`,
      ),
    };
  },
  comunicado(titulo: string, corpo: string) {
    return {
      subject: titulo,
      html: layout(titulo, `${corpo.split("\n").map((p) => `<p>${p}</p>`).join("")}${button(`${env.siteUrl}/membros`, "Abrir a comunidade")}`),
    };
  },
  leadInterno(tipo: string, campos: Record<string, string | null | undefined>) {
    const linhas = Object.entries(campos)
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:6px 0;color:#8A8580;width:140px">${k}</td><td style="padding:6px 0">${String(v).replace(/\n/g, "<br>")}</td></tr>`)
      .join("");
    return {
      subject: `[Site] Novo contato: ${tipo}`,
      html: layout(`Novo contato pelo site: ${tipo}`, `<table style="width:100%;font-size:15px">${linhas}</table>`),
    };
  },
  leadConfirmacao(nome: string, tipo: string) {
    const msg =
      tipo === "palestra" || tipo === "parceria"
        ? "Recebemos sua solicitação. A equipe comercial retorna em até 2 dias úteis com disponibilidade e proposta."
        : "Recebemos sua mensagem. A equipe retorna em até 1 dia útil pelo e-mail ou WhatsApp informado.";
    return { subject: "Recebemos sua mensagem", html: layout(`Obrigada, ${nome}.`, `<p>${msg}</p>`) };
  },
};
