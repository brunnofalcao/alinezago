"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Src = { local: string; remote?: string };

type Props = {
  src: Src;
  alt: string;
  className?: string;
  imgClassName?: string;
  label?: string; // texto do placeholder quando não houver imagem
  priority?: boolean;
};

/**
 * Imagem com fallback em cadeia: arquivo local em /public → original do Wix → placeholder.
 * Assim o site nunca mostra imagem quebrada enquanto as fotos finais não chegam.
 */
export function Figure({ src, alt, className, imgClassName, label, priority }: Props) {
  const chain = [src.local, src.remote].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const current = chain[idx];

  if (!current) {
    return (
      <div className={cn("relative flex items-end bg-taupe-soft", className)} role="img" aria-label={alt}>
        <span className="m-4 border border-taupe-deep/40 px-2 py-1 text-xs text-taupe-deep">{label ?? "Imagem a inserir"}</span>
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-taupe-soft", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onError={() => setIdx((i) => i + 1)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
