import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Shell, type NavItem } from "@/components/app/Shell";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/membros", label: "Início", icon: "grid" },
  { href: "/membros/aulas", label: "Aulas", icon: "video" },
  { href: "/membros/perfil", label: "Meu perfil", icon: "user" },
];

export default async function MembrosLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const items = profile?.role === "admin" ? [...nav, { href: "/admin", label: "Painel ADM", icon: "settings" }] : nav;
  const name = profile?.full_name || user.email;
  const canEnter = profile?.status === "ativo" || profile?.role === "admin";

  return (
    <Shell nav={items} title="Comunidade" user={{ name, email: user.email }} badge={profile ? profile.status : undefined}>
      {!profile ? (
        <div className="card p-6">
          <p className="font-display text-lg font-medium">Não foi possível carregar este módulo.</p>
          <p className="mt-2 text-sm text-pedra-600">Seu perfil ainda não foi criado. Saia e entre novamente; se persistir, fale com a equipe.</p>
        </div>
      ) : !canEnter ? (
        <div className="max-w-xl">
          <h1 className="text-d-3 font-light text-grafite">{profile.status === "pendente" ? "Cadastro em análise" : "Acesso inativo"}</h1>
          <p className="mt-3 text-pedra-600">
            {profile.status === "pendente"
              ? "Recebemos seu cadastro. A equipe confirma seus dados e libera o acesso em até 2 dias úteis. Você receberá um e-mail quando estiver tudo pronto."
              : "Seu acesso à comunidade está inativo. Se você está em acompanhamento, fale com a equipe para reativar."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappLink(site.whatsapp, "Olá! Fiz meu cadastro na comunidade e gostaria de confirmar meu acesso.")} target="_blank" rel="noreferrer" className="btn btn-md btn-primary">Falar com a equipe</a>
            <Link href="/membros/perfil" className="btn btn-md btn-outline">Conferir meus dados</Link>
          </div>
        </div>
      ) : (
        children
      )}
    </Shell>
  );
}
