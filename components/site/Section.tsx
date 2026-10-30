import { cn } from "@/lib/utils";

export function Section({ children, className, id, tone = "creme" }: { children: React.ReactNode; className?: string; id?: string; tone?: "creme" | "white" | "dark" | "taupe" | "areia" }) {
  const tones = { creme: "bg-creme", white: "bg-white", dark: "bg-grafite text-marfim", taupe: "bg-taupe-soft", areia: "bg-areia" };
  return (
    <section id={id} className={cn("py-16 sm:py-24 lg:py-28", tones[tone], className)}>
      <div className="container-site">{children}</div>
    </section>
  );
}

export function Heading({ children, sub, className, as: Tag = "h2" }: { children: React.ReactNode; sub?: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Tag className={cn(Tag === "h1" ? "text-d-1" : "text-d-2", "font-light")}>{children}</Tag>
      {sub && <p className="mt-4 max-w-prose text-lead text-pedra-600 sm:mt-5">{sub}</p>}
    </div>
  );
}
