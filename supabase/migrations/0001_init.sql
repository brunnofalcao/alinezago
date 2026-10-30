-- =====================================================================
-- Dra. Aline Zago · Comunidade + Painel ADM
-- Rode no SQL Editor do Supabase (projeto novo). Idempotente onde possível.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos ----------
do $$ begin
  create type member_status as enum ('pendente', 'ativo', 'inativo');
exception when duplicate_object then null; end $$;
do $$ begin
  create type user_role as enum ('member', 'admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type attendance_status as enum ('presente', 'ausente', 'justificada');
exception when duplicate_object then null; end $$;
do $$ begin
  create type lead_type as enum ('paciente', 'palestra', 'parceria', 'outro');
exception when duplicate_object then null; end $$;
do $$ begin
  create type lead_status as enum ('novo', 'contatado', 'encerrado');
exception when duplicate_object then null; end $$;

-- ---------- Perfis (1:1 com auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,                       -- E.164 sem "+", ex.: 5561999999999
  role user_role not null default 'member',
  status member_status not null default 'pendente',
  tags text[] not null default '{}',
  notes text,
  consent_whatsapp boolean not null default false,
  last_inbound_at timestamptz,      -- última mensagem recebida no WhatsApp (janela de 24h)
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_phone_idx on public.profiles(phone);

-- Cria o perfil automaticamente no cadastro (dados vêm de signInWithOtp options.data)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, consent_whatsapp)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), ''),
    coalesce((new.raw_user_meta_data->>'consent_whatsapp')::boolean, false)
  )
  on conflict (id) do nothing;
  -- normaliza telefone BR sem DDI
  update public.profiles set phone = '55' || phone where id = new.id and phone is not null and length(phone) <= 11;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Admin? (security definer para não recursar na RLS)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_active_member()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'ativo');
$$;

-- ---------- Aulas ao vivo ----------
create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  duration_min int not null default 60 check (duration_min between 10 and 600),
  meeting_url text,
  recording_url text,
  material_url text,
  published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists live_classes_starts_idx on public.live_classes(starts_at);

-- ---------- Presença / chamada ----------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.live_classes(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status attendance_status not null default 'presente',
  source text not null default 'checkin' check (source in ('checkin', 'admin')),
  checked_at timestamptz not null default now(),
  unique (class_id, profile_id)
);

-- ---------- Comunicados ----------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

-- ---------- Leads (site, mídia kit) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type lead_type not null default 'outro',
  name text not null,
  email text not null,
  phone text,
  company text,
  message text,
  source text,
  status lead_status not null default 'novo',
  created_at timestamptz not null default now()
);

-- ---------- Relacionamento (timeline por paciente) ----------
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('nota', 'ligacao', 'whatsapp', 'email', 'consulta')),
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists interactions_profile_idx on public.interactions(profile_id, created_at desc);

-- ---------- Log de mensagens (e-mail + WhatsApp, saída e entrada) ----------
create table if not exists public.message_log (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'whatsapp')),
  direction text not null default 'out' check (direction in ('out', 'in')),
  to_ref text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  template text,
  status text not null default 'sent',
  external_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists message_log_profile_idx on public.message_log(profile_id, created_at desc);
create index if not exists message_log_external_idx on public.message_log(external_id);

-- ---------- Controle de lembretes enviados ----------
create table if not exists public.class_notifications (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.live_classes(id) on delete cascade,
  kind text not null,
  recipients int not null default 0,
  sent_at timestamptz not null default now(),
  unique (class_id, kind)
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.live_classes enable row level security;
alter table public.attendance enable row level security;
alter table public.announcements enable row level security;
alter table public.leads enable row level security;
alter table public.interactions enable row level security;
alter table public.message_log enable row level security;
alter table public.class_notifications enable row level security;

-- profiles
drop policy if exists "profiles: leitura própria ou admin" on public.profiles;
create policy "profiles: leitura própria ou admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: membro edita dados próprios" on public.profiles;
create policy "profiles: membro edita dados próprios" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Membro não pode alterar o próprio papel/status: trigger (sem subselect na policy, evita recursão de RLS)
create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
    new.approved_at := old.approved_at;
    new.email := old.email;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields before update on public.profiles
  for each row execute function public.protect_profile_fields();
drop policy if exists "profiles: admin tudo" on public.profiles;
create policy "profiles: admin tudo" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- live_classes
drop policy if exists "aulas: membro ativo lê publicadas" on public.live_classes;
create policy "aulas: membro ativo lê publicadas" on public.live_classes
  for select using (published and public.is_active_member());
drop policy if exists "aulas: admin tudo" on public.live_classes;
create policy "aulas: admin tudo" on public.live_classes
  for all using (public.is_admin()) with check (public.is_admin());

-- attendance
drop policy if exists "presença: membro lê a própria" on public.attendance;
create policy "presença: membro lê a própria" on public.attendance
  for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "presença: membro faz check-in" on public.attendance;
create policy "presença: membro faz check-in" on public.attendance
  for insert with check (
    profile_id = auth.uid() and source = 'checkin' and status = 'presente' and public.is_active_member()
    and exists (
      select 1 from public.live_classes c
      where c.id = class_id and c.published
        and now() between c.starts_at - interval '30 minutes' and c.starts_at + (c.duration_min || ' minutes')::interval
    )
  );
drop policy if exists "presença: admin tudo" on public.attendance;
create policy "presença: admin tudo" on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- announcements
drop policy if exists "comunicados: membro ativo lê" on public.announcements;
create policy "comunicados: membro ativo lê" on public.announcements
  for select using (public.is_active_member() or public.is_admin());
drop policy if exists "comunicados: admin tudo" on public.announcements;
create policy "comunicados: admin tudo" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- leads, interactions, message_log, class_notifications: só admin (inserções do site usam service_role)
drop policy if exists "leads: admin" on public.leads;
create policy "leads: admin" on public.leads for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "interactions: admin" on public.interactions;
create policy "interactions: admin" on public.interactions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "message_log: admin" on public.message_log;
create policy "message_log: admin" on public.message_log for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "class_notifications: admin" on public.class_notifications;
create policy "class_notifications: admin" on public.class_notifications for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Primeiro admin: rode DEPOIS de fazer o primeiro login com o e-mail da equipe.
-- update public.profiles set role = 'admin', status = 'ativo', approved_at = now() where email = 'equipe@exemplo.com.br';
-- =====================================================================
