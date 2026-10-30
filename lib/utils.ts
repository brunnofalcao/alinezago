const TZ = "America/Sao_Paulo";

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric", ...opts }).format(d);
}

export function formatDateTime(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function formatTime(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
}

/** Estado da aula calculado a partir do horário. Janela "ao vivo" abre 30 min antes. */
export function classState(startsAt: string, durationMin: number, now = new Date()) {
  const start = new Date(startsAt).getTime();
  const end = start + durationMin * 60_000;
  const t = now.getTime();
  if (t < start - 30 * 60_000) return "agendada" as const;
  if (t <= end) return "ao_vivo" as const;
  return "encerrada" as const;
}

export function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

/** Normaliza para formato E.164 sem "+" (padrão da Cloud API). Assume Brasil quando faltar DDI. */
export function normalizePhone(v: string) {
  let d = onlyDigits(v);
  if (!d) return "";
  if (d.length <= 11) d = "55" + d;
  return d;
}

export function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function whatsappLink(number: string, text?: string) {
  const base = `https://wa.me/${onlyDigits(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
