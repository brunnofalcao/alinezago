import type { SVGProps } from "react";

/** Ícones de linha da identidade (traço 12/512, currentColor). */
type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  viewBox: "0 0 512 512",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 12,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export function IconDiagnostico(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M340 220c0 66.274-53.726 120-120 120s-120-53.726-120-120 53.726-120 120-120 120 53.726 120 120" />
      <path d="m310 310 102 102" />
      <path d="M140 230h45l20-30 25 60 25-45 20 20h25" />
      <path d="M170 150v-20" />
      <path d="M160 140h-20" />
    </svg>
  );
}

export function IconEstrategia(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M110 340c20-110 100-160 146-130 49 34 64 90 14 120-60 40-35 100 50 80 72-18 90-80 70-140" />
      <circle cx="132" cy="280" r="10" />
      <circle cx="256" cy="210" r="10" />
      <circle cx="270" cy="330" r="10" />
      <circle cx="350" cy="400" r="10" />
    </svg>
  );
}

export function IconExecucao(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M130 300c35 30 60 50 85 70 45-50 95-100 167-150" />
      <path d="M150 250c60-30 120-35 200-10" />
      <circle cx="382" cy="220" r="10" />
    </svg>
  );
}

export function IconSustentacao(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M140 280c20-60 90-60 116 0s96 60 116 0-50-60-116 0-136 60-116 0" />
      <path d="M170 370c50 30 122 30 172 0" />
    </svg>
  );
}

export const metodoIcons = [IconDiagnostico, IconEstrategia, IconExecucao, IconSustentacao];
