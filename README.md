# Site Dra. Aline Zago

Next.js 15 (App Router) + Tailwind + Supabase (Auth e banco) + Resend (e-mail) + Meta WhatsApp Cloud API. Deploy na Vercel.

## O que tem

| Área | Rota | O que faz |
|---|---|---|
| Site público | `/`, `/sobre`, `/atendimentos`, `/comunidade`, `/contato`, `/politica-de-privacidade` | Posicionamento, consulta online, captação pelo WhatsApp |
| Mídia kit | `/midia-kit` | Temas, formatos, números, galeria, bio copiável, fotos em alta, pedido de proposta |
| Acesso | `/cadastro`, `/entrar`, `/auth/callback` | Login sem senha por link no e-mail (Supabase OTP). Cadastro entra como *pendente* |
| Membros | `/membros`, `/membros/aulas`, `/membros/aulas/[id]`, `/membros/perfil` | Próxima aula, check-in com presença automática, gravações, avisos |
| Painel ADM | `/admin`, `/admin/membros`, `/admin/membros/[id]`, `/admin/aulas`, `/admin/aulas/[id]`, `/admin/comunicados`, `/admin/mensagens`, `/admin/leads`, `/admin/configuracoes` | CRM de pacientes, aprovação, linha do tempo, chamada, disparos, contatos do site |
| API | `/api/leads`, `/api/whatsapp/webhook`, `/api/cron/lembretes`, `/api/admin/aulas/[id]/export` | Formulários, recebimento Meta, lembretes 24h/1h, CSV da chamada |

## Subir em 30 minutos

1. **Supabase**: crie um projeto. SQL Editor → cole `supabase/migrations/0001_init.sql` → Run.
   Em Authentication → URL Configuration: Site URL = sua URL; Redirect URLs = `https://SEU-DOMINIO/auth/callback` e `http://localhost:3000/auth/callback`.
   Em Authentication → Providers → Email: deixe "Confirm email" ligado (o login é por link). Opcional: SMTP customizado apontando para o Resend para os e-mails de login saírem do domínio dela.
2. **Variáveis**: copie `.env.example` para `.env.local` e preencha. Na Vercel, cadastre as mesmas em Settings → Environment Variables.
3. **Rodar**: `npm install && npm run dev`.
4. **Primeiro admin**: acesse `/cadastro` com o e-mail da equipe, entre pelo link, depois rode no SQL Editor:
   `update public.profiles set role='admin', status='ativo', approved_at=now() where email='EMAIL';`
5. **Resend**: verifique o domínio, crie a API key, defina `EMAIL_FROM` com um remetente desse domínio e `CONTACT_TO_EMAIL` com quem recebe os contatos.
6. **Meta WhatsApp**: no app da Meta (Cloud API) pegue `WHATSAPP_PHONE_NUMBER_ID` e um token de sistema permanente (`WHATSAPP_ACCESS_TOKEN`). Cadastre o webhook `https://SEU-DOMINIO/api/whatsapp/webhook` com o `WHATSAPP_VERIFY_TOKEN` que você inventar, assine o campo `messages`, e copie o App Secret para `META_APP_SECRET`. Crie e aprove os templates `lembrete_aula` ({{1}} nome, {{2}} aula, {{3}} horário, {{4}} link) e `boas_vindas_comunidade` ({{1}} nome, {{2}} link), ou troque os nomes nas variáveis.
7. **Cron**: defina `CRON_SECRET` na Vercel. O `vercel.json` já agenda `/api/cron/lembretes` a cada hora.
8. **Fotos**: `npm run assets:wix` baixa as fotos do site antigo para `public/images`. Troque pelos arquivos finais mantendo os nomes.
9. **Domínio**: aponte o DNS para a Vercel e atualize `NEXT_PUBLIC_SITE_URL`.

## Identidade visual

`public/brand/` tem a logomarca oficial trimada (horizontal e vertical, versão escura e clara), o isotipo em 3 cores e os ícones de linha do método em `public/brand/icons/` (também como componentes em `components/site/BrandIcons.tsx`). Favicon, ícone iOS e imagem de compartilhamento (Open Graph) estão em `app/` e saem do isotipo. Tipografia: Jost (display, alinhada ao logotipo) e Inter (texto).

## Onde editar conteúdo

`content/site.ts`: todos os textos, FAQ, temas e formatos do mídia kit, números (vazio aparece como "a confirmar"), marcas convidantes (lista vazia esconde a seção) e os caminhos das fotos.

## Regras de acesso

- Cadastro cria perfil `pendente`. Só `ativo` vê aulas, gravações e avisos. `admin` vê tudo.
- RLS no Postgres garante isso no banco, não só na tela. Formulários públicos e webhook escrevem com `service_role` (servidor).
- Check-in de presença só é aceito na janela da aula (30 min antes até o fim), também imposto por policy.
- Texto livre no WhatsApp só dentro da janela de 24h após mensagem do paciente; fora dela, apenas template aprovado.

## Estados de tela

Todas as telas tratam: sem dados ("Não há dados disponíveis ainda."), sem integração ("Falta configuração."), sem permissão ("Você não tem permissão para acessar esta área.") e erro ("Não foi possível carregar este módulo.").
