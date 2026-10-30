import { Plus } from "lucide-react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-taupe-line border-y border-taupe-line">
      {items.map((it) => (
        <details key={it.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-medium text-grafite marker:content-none">
            {it.q}
            <Plus size={20} className="shrink-0 text-taupe-deep transition-transform group-open:rotate-45" aria-hidden />
          </summary>
          <p className="max-w-prose pb-6 text-pedra-600">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
