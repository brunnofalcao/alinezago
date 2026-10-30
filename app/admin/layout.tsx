import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Shell, type NavItem } from "@/components/app/Shell";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: "grid" },
  { href: "/admin/membros", label: "Membros", icon: "users" },
  { href: "/admin/aulas", label: "Aulas e chamada", icon: "video" },
  { href: "/admin/comunicados", label: "Comunicados", icon: "megaphone" },
  { href: "/admin/mensagens", label: "Disparos", icon: "message" },
  { href: "/admin/leads", label: "Contatos do site", icon: "inbox" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "settings" },
  { href: "/membros", label: "Ver como membro", icon: "user" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const isAdmin = profile?.role === "admin";
  return (
    <Shell nav={isAdmin ? nav : [{ href: "/membros", label: "Comunidade", icon: "grid" }]} title="Painel ADM" user={{ name: profile?.full_name || user.email, email: user.email }}>
      {isAdmin ? children : (
        <div className="max-w-lg">
          <h1 className="text-d-3 font-light text-grafite">Você não tem permissão para acessar esta área.</h1>
          <p className="mt-3 text-pedra-600">Esta conta não é administradora. Se você faz parte da equipe, peça para liberarem seu acesso.</p>
          <Link href="/membros" className="btn btn-md btn-outline mt-6">Voltar para a comunidade</Link>
        </div>
      )}
    </Shell>
  );
}
