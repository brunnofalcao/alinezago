import Link from "next/link";
import { site } from "@/content/site";
import { Figure } from "@/components/site/Figure";
import { cn } from "@/lib/utils";

export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name}, página inicial`}>
      <span className={cn("flex h-11 w-11 items-center justify-center", dark ? "bg-marfim" : "bg-grafite")}>
        <Figure src={site.images.isotipo} alt="" className="h-7 w-7 bg-transparent" imgClassName="object-contain" label="" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={cn("block font-display text-[17px] font-medium tracking-[0.08em]", dark ? "text-marfim" : "text-grafite")}>{site.name}</span>
          <span className={cn("block text-xs tracking-wide", dark ? "text-marfim/70" : "text-pedra")}>{site.role}</span>
        </span>
      )}
    </Link>
  );
}
