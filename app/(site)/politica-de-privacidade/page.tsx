import type { Metadata } from "next";
import { Section } from "@/components/site/Section";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Política de privacidade", robots: { index: false } };

export default function PrivacidadePage() {
  return (
    <Section>
      <article className="prose-custom max-w-prose space-y-6 text-pedra-600">
        <h1 className="text-d-2 font-light text-grafite">Política de privacidade</h1>
        <p>Esta política explica como {site.name} ({site.crm}) trata os dados pessoais coletados neste site e na comunidade de pacientes, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
        <h2 className="text-d-3 font-light text-grafite">Quais dados coletamos</h2>
        <p>Formulários de contato e mídia kit: nome, e-mail, WhatsApp, empresa e mensagem. Cadastro na comunidade: nome, e-mail, WhatsApp e consentimento para receber mensagens. Uso da comunidade: registro de presença em aulas e interações com a equipe. Não coletamos dados clínicos pelo site; informações de saúde são tratadas exclusivamente no prontuário médico, fora desta plataforma.</p>
        <h2 className="text-d-3 font-light text-grafite">Para que usamos</h2>
        <p>Responder contatos, avaliar e liberar o acesso à comunidade, enviar avisos e lembretes de aulas (por e-mail e, com consentimento, por WhatsApp), e acompanhar a participação dos pacientes nas atividades da comunidade.</p>
        <h2 className="text-d-3 font-light text-grafite">Com quem compartilhamos</h2>
        <p>Operadores necessários ao funcionamento do serviço: hospedagem e banco de dados (Vercel e Supabase), envio de e-mails (Resend) e mensagens de WhatsApp (Meta Platforms). Nenhum dado é vendido ou cedido para fins de marketing de terceiros.</p>
        <h2 className="text-d-3 font-light text-grafite">Seus direitos</h2>
        <p>Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, e revogar o consentimento para mensagens a qualquer momento, pelos canais de contato deste site. Dados de prontuário seguem as regras de guarda do Conselho Federal de Medicina.</p>
        <h2 className="text-d-3 font-light text-grafite">Cookies</h2>
        <p>Usamos apenas cookies estritamente necessários para manter a sessão de quem acessa a área de membros. Não usamos cookies de publicidade.</p>
        <p className="text-sm text-pedra">Última atualização: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date())}.</p>
      </article>
    </Section>
  );
}
