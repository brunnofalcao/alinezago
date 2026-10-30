import { cn } from "@/lib/utils";

export function Section({ children, className, id, tone = "creme" }: { children: React.ReactNode; className?: string; id?: string; tone?: "creme" | "white" | "dark" | "taupe" }) {
  const tones = { creme: "bg-creme", white: "bg-white", dark: "bg-grafite text-marfim", taupe: "bg-taupe-soft" };
  return (
    <section id={id} className={cn("py-20 sm:py-28", tones[tone], className)}>
      <div className="container-site">{children}</div>
    </section>
  );
}

export function Heading({ children, sub, className, as: Tag = "h2" }: { children: React.ReactNode; sub?: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Tag className={cn(Tag === "h1" ? "text-d-1" : "text-d-2", "font-light")}>{children}</Tag>
      {sub && <p className="mt-5 max-w-prose text-lead text-pedra-600">{sub}</p>}
    </div>
  );
}
