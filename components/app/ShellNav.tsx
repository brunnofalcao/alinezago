"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Video, Megaphone, MessageSquare, Inbox, Settings, User, CalendarDays, type LucideIcon } from "lucide-react";
import type { NavItem } from "@/components/app/Shell";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { grid: LayoutGrid, users: Users, video: Video, megaphone: Megaphone, message: MessageSquare, inbox: Inbox, settings: Settings, user: User, calendar: CalendarDays };

export function ShellNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="flex snap-x gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-col lg:px-3 lg:pb-0 [&::-webkit-scrollbar]:hidden" aria-label="Seções">
      {items.map((it) => {
        const Icon = icons[it.icon] ?? LayoutGrid;
        const active = it.href === path || (it.href !== "/membros" && it.href !== "/admin" && path.startsWith(it.href));
        return (
          <Link key={it.href} href={it.href} className={cn("flex h-11 shrink-0 snap-start items-center gap-2.5 px-3 text-sm font-medium text-marfim/70 hover:bg-marfim/5 hover:text-marfim lg:h-auto lg:gap-3 lg:py-2.5", active && "bg-marfim/10 text-marfim")}
            aria-current={active ? "page" : undefined}>
            <Icon size={18} aria-hidden /> {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
