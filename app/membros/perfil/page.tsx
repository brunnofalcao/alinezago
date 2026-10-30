import { requireUser } from "@/lib/auth";
import { PageTitle, Card, Badge, Flash } from "@/components/app/Shell";
import { updateProfile } from "./actions";

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { user, profile } = await requireUser();
  return (
    <>
      <PageTitle title="Meu perfil" text="Mantenha seu WhatsApp atualizado para receber os lembretes das aulas." />
      <Flash ok={sp.ok ? "Dados salvos." : undefined} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Dados" className="lg:col-span-2">
          <form action={updateProfile} className="grid gap-4 sm:max-w-lg">
            <div>
              <label className="label" htmlFor="full_name">Nome completo</label>
              <input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} className="field" required />
            </div>
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" value={user.email} className="field bg-creme" disabled />
            </div>
            <div>
              <label className="label" htmlFor="phone">WhatsApp</label>
              <input id="phone" name="phone" defaultValue={profile?.phone ?? ""} className="field" inputMode="tel" />
            </div>
            <label className="flex items-start gap-3 text-sm text-pedra-600">
              <input type="checkbox" name="consent_whatsapp" defaultChecked={profile?.consent_whatsapp} className="mt-1 h-4 w-4 accent-taupe-deep" />
              <span>Quero receber avisos e lembretes das aulas pelo WhatsApp.</span>
            </label>
            <div><button className="btn btn-md btn-primary">Salvar alterações</button></div>
          </form>
        </Card>
        <Card title="Acesso">
          <p className="text-sm text-pedra-600">Situação do cadastro</p>
          <div className="mt-2">{profile && <Badge value={profile.status} />}</div>
          <p className="mt-4 text-sm text-pedra-600">Membro desde {profile ? new Date(profile.created_at).toLocaleDateString("pt-BR") : ""}</p>
          <form action="/auth/sair" method="post" className="mt-6"><button className="btn btn-sm btn-outline">Sair da conta</button></form>
        </Card>
      </div>
    </>
  );
}
