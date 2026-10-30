import type { LiveClass } from "@/lib/types";

/** Converte ISO para o valor do input datetime-local em horário de Brasília. */
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

export function ClassForm({ action, cls, submitLabel }: { action: (fd: FormData) => Promise<void>; cls?: LiveClass; submitLabel: string }) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {cls && <input type="hidden" name="id" value={cls.id} />}
      <div className="sm:col-span-2"><label className="label" htmlFor="title">Título</label><input id="title" name="title" defaultValue={cls?.title ?? ""} className="field" required /></div>
      <div><label className="label" htmlFor="starts_at">Data e hora (Brasília)</label><input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocalInput(cls?.starts_at)} className="field" required /></div>
      <div><label className="label" htmlFor="duration_min">Duração (minutos)</label><input id="duration_min" name="duration_min" type="number" min={10} max={600} defaultValue={cls?.duration_min ?? 60} className="field" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="description">Descrição</label><textarea id="description" name="description" rows={3} defaultValue={cls?.description ?? ""} className="field" /></div>
      <div><label className="label" htmlFor="meeting_url">Link da sala (Zoom, Meet, YouTube ao vivo)</label><input id="meeting_url" name="meeting_url" type="url" defaultValue={cls?.meeting_url ?? ""} className="field" placeholder="https://" /></div>
      <div><label className="label" htmlFor="recording_url">Link da gravação</label><input id="recording_url" name="recording_url" type="url" defaultValue={cls?.recording_url ?? ""} className="field" placeholder="https://" /></div>
      <div><label className="label" htmlFor="material_url">Material de apoio (PDF, Drive)</label><input id="material_url" name="material_url" type="url" defaultValue={cls?.material_url ?? ""} className="field" placeholder="https://" /></div>
      <label className="flex items-center gap-3 self-end pb-2 text-sm text-grafite"><input type="checkbox" name="published" defaultChecked={cls?.published ?? true} className="h-4 w-4 accent-taupe-deep" /> Visível para os membros</label>
      <div className="sm:col-span-2"><button className="btn btn-md btn-primary">{submitLabel}</button></div>
    </form>
  );
}
