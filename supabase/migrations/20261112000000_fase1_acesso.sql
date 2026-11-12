-- =====================================================================
-- Álbum Familiar — Fase 1: Acesso
-- Tabelas: familia, membros, convites, aceites_termo
-- Regra de ouro: RLS ligado em TODAS as tabelas. O navegador nunca
-- altera papel nem convite diretamente; isso só acontece pelas funções
-- abaixo, que conferem quem está pedindo.
-- Como aplicar: Supabase > SQL Editor > New query > colar tudo > Run.
-- =====================================================================

-- ---------- Tipos ----------
create type public.papel as enum ('admin', 'membro', 'visitante');

-- ---------- Tabelas ----------
create table public.familia (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Álbum Familiar',
  criada_em timestamptz not null default now()
);
-- O app tem uma família só (várias famílias está fora do escopo).
create unique index familia_unica on public.familia ((true));

create table public.convites (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familia (id) on delete cascade,
  -- 8 letras/números sem os confusos (sem I, O, 0, 1)
  codigo text not null unique check (codigo ~ '^[A-HJ-NP-Z2-9]{8}$'),
  papel public.papel not null default 'membro' check (papel <> 'admin'),
  para_quem text check (char_length(para_quem) <= 60),
  criado_por uuid references auth.users (id) on delete set null,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '7 days',
  usado_por uuid references auth.users (id) on delete set null,
  usado_em timestamptz,
  cancelado_em timestamptz
);

create table public.membros (
  user_id uuid primary key references auth.users (id) on delete cascade,
  familia_id uuid not null references public.familia (id) on delete cascade,
  papel public.papel not null default 'membro',
  nome text not null default '' check (char_length(nome) <= 60),
  email text not null,
  letras_grandes boolean not null default false,
  consentimento_rosto boolean, -- perguntado na Fase 4 (vazio = ainda não respondeu)
  termo_versao text,
  termo_aceito_em timestamptz,
  convite_id uuid references public.convites (id) on delete set null,
  entrou_em timestamptz not null default now()
);

-- Histórico de aceites do termo de privacidade (LGPD: aceite registrado com data)
create table public.aceites_termo (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  versao text not null,
  aceito_em timestamptz not null default now()
);
create index aceites_termo_user on public.aceites_termo (user_id);

-- ---------- Funções auxiliares (usadas pelas regras de acesso) ----------
create function public.email_administrador() returns text
language sql immutable set search_path = '' as $$
  select 'scampojr83@gmail.com'::text
$$;

create function public.meu_papel() returns public.papel
language sql stable security definer set search_path = '' as $$
  select papel from public.membros where user_id = auth.uid()
$$;

create function public.eh_da_familia() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.membros where user_id = auth.uid())
$$;

create function public.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.membros where user_id = auth.uid() and papel = 'admin')
$$;

create function public._gerar_codigo() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 símbolos
  b bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  posicoes constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11]; -- bytes 100% aleatórios do UUID
  r text := '';
  p int;
begin
  foreach p in array posicoes loop
    r := r || substr(alfabeto, (get_byte(b, p) % 32) + 1, 1);
  end loop;
  return r;
end $$;

-- ---------- Ações (chamadas pelo app) ----------

-- Entrar na família: o administrador entra direto no primeiro acesso;
-- os demais precisam de um convite válido (7 dias, uso único).
create function public.entrar_na_familia(codigo_convite text default null)
returns public.membros
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_email text;
  v_nome text;
  m public.membros;
  c public.convites;
  fam uuid;
  cod text := upper(regexp_replace(coalesce(codigo_convite, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if uid is null then
    raise exception 'nao_autenticado';
  end if;

  select * into m from public.membros where user_id = uid;
  if found then
    return m;
  end if;

  select lower(u.email),
         left(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), 60)
    into v_email, v_nome
    from auth.users u
   where u.id = uid and u.email_confirmed_at is not null;
  if v_email is null then
    raise exception 'email_nao_confirmado';
  end if;

  -- Primeiro acesso do administrador
  if v_email = public.email_administrador() then
    perform pg_advisory_xact_lock(4242);
    select id into fam from public.familia limit 1;
    if fam is null then
      insert into public.familia default values returning id into fam;
    end if;
    if not exists (select 1 from public.membros where papel = 'admin') then
      insert into public.membros (user_id, familia_id, papel, nome, email)
      values (uid, fam, 'admin', v_nome, v_email)
      returning * into m;
      return m;
    end if;
  end if;

  if cod = '' then
    raise exception 'convite_necessario';
  end if;

  select * into c from public.convites where codigo = cod for update;
  if not found or c.cancelado_em is not null then
    raise exception 'convite_invalido';
  end if;
  if c.usado_em is not null then
    raise exception 'convite_usado';
  end if;
  if c.expira_em < now() then
    raise exception 'convite_expirado';
  end if;

  update public.convites set usado_por = uid, usado_em = now() where id = c.id;

  insert into public.membros (user_id, familia_id, papel, nome, email, convite_id)
  values (uid, c.familia_id, c.papel, v_nome, v_email, c.id)
  returning * into m;
  return m;
end $$;

create function public.criar_convite(p_papel public.papel default 'membro', p_para_quem text default null)
returns public.convites
language plpgsql security definer set search_path = '' as $$
declare
  c public.convites;
  fam uuid;
  tentativa int := 0;
begin
  if not public.eh_admin() then
    raise exception 'somente_admin';
  end if;
  if p_papel = 'admin' then
    raise exception 'papel_invalido';
  end if;
  select familia_id into fam from public.membros where user_id = auth.uid();
  loop
    tentativa := tentativa + 1;
    begin
      insert into public.convites (familia_id, codigo, papel, para_quem, criado_por)
      values (fam, public._gerar_codigo(), p_papel, nullif(left(trim(coalesce(p_para_quem, '')), 60), ''), auth.uid())
      returning * into c;
      return c;
    exception when unique_violation then
      if tentativa >= 5 then
        raise;
      end if;
    end;
  end loop;
end $$;

create function public.cancelar_convite(p_convite uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_admin() then
    raise exception 'somente_admin';
  end if;
  update public.convites set cancelado_em = now()
   where id = p_convite and usado_em is null and cancelado_em is null;
end $$;

create function public.definir_papel(p_user uuid, p_papel public.papel) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_admin() then
    raise exception 'somente_admin';
  end if;
  if p_user = auth.uid() then
    raise exception 'nao_pode_alterar_a_si_mesmo';
  end if;
  if p_papel = 'admin' then
    raise exception 'papel_invalido';
  end if;
  update public.membros set papel = p_papel where user_id = p_user;
end $$;

create function public.remover_membro(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_admin() then
    raise exception 'somente_admin';
  end if;
  if p_user = auth.uid() then
    raise exception 'nao_pode_alterar_a_si_mesmo';
  end if;
  delete from public.membros where user_id = p_user;
end $$;

create function public.aceitar_termo(p_versao text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_da_familia() then
    raise exception 'nao_e_da_familia';
  end if;
  if coalesce(trim(p_versao), '') = '' then
    raise exception 'versao_invalida';
  end if;
  update public.membros set termo_versao = p_versao, termo_aceito_em = now()
   where user_id = auth.uid();
  insert into public.aceites_termo (user_id, versao) values (auth.uid(), p_versao);
end $$;

-- "Excluir minha conta e meus dados" (LGPD). Apaga o login; o resto some em cascata.
create function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'nao_autenticado';
  end if;
  if public.eh_admin() then
    raise exception 'admin_nao_pode_excluir';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- Regras de acesso (RLS) ----------
alter table public.familia enable row level security;
alter table public.membros enable row level security;
alter table public.convites enable row level security;
alter table public.aceites_termo enable row level security;

-- Ninguém sem login enxerga nada; com login, só o que as regras liberam.
revoke all on public.familia, public.membros, public.convites, public.aceites_termo from anon, authenticated;
grant select on public.familia, public.membros, public.convites, public.aceites_termo to authenticated;
-- Cada um só pode mudar o próprio nome e a opção "Letras grandes".
grant update (nome, letras_grandes) on public.membros to authenticated;

create policy familia_ler on public.familia for select to authenticated
  using (public.eh_da_familia());

-- Admin e membros veem a lista da família; visitante vê só a si mesmo.
create policy membros_ler on public.membros for select to authenticated
  using (user_id = auth.uid() or public.meu_papel() in ('admin', 'membro'));

create policy membros_editar_proprio on public.membros for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy convites_ler on public.convites for select to authenticated
  using (public.eh_admin());

create policy aceites_ler on public.aceites_termo for select to authenticated
  using (user_id = auth.uid() or public.eh_admin());

-- ---------- Quem pode chamar cada função ----------
revoke execute on function
  public.email_administrador(), public.meu_papel(), public.eh_da_familia(), public.eh_admin(),
  public._gerar_codigo(), public.entrar_na_familia(text), public.criar_convite(public.papel, text),
  public.cancelar_convite(uuid), public.definir_papel(uuid, public.papel), public.remover_membro(uuid),
  public.aceitar_termo(text), public.excluir_minha_conta()
  from public, anon;

grant execute on function
  public.meu_papel(), public.eh_da_familia(), public.eh_admin(),
  public.entrar_na_familia(text), public.criar_convite(public.papel, text),
  public.cancelar_convite(uuid), public.definir_papel(uuid, public.papel), public.remover_membro(uuid),
  public.aceitar_termo(text), public.excluir_minha_conta()
  to authenticated;
