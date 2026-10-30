import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type Props = { dark?: boolean; compact?: boolean; className?: string; size?: "sm" | "md" | "lg" };

/**
 * Logomarca oficial (PNG trimado em /public/brand).
 * dark = versão clara para fundos escuros. compact = só o isotipo.
 */
export function Logo({ dark = false, compact = false, className, size = "md" }: Props) {
  const h = { sm: "h-8", md: "h-10 sm:h-11", lg: "h-14 sm:h-16" }[size];
  const src = compact ? (dark ? site.brand.isotipoClaro : site.brand.isotipoEscuro) : dark ? site.brand.logoHorizontalClaro : site.brand.logoHorizontalEscuro;
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label={`${site.fullName}, página inicial`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${site.fullName}, ${site.tagline}`} className={cn(h, "w-auto")} decoding="async" fetchPriority="high" />
    </Link>
  );
}
