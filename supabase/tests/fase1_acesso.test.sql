-- Testes das regras de acesso da Fase 1. Rodar com: npm run test:banco
-- Cada bloco "do" para tudo com erro se a regra não se comportar como esperado.
\set ON_ERROR_STOP 1
\set QUIET 1

-- Pessoas de teste
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'scampojr83@gmail.com', now(), '{"full_name":"Salvatore"}'),
  ('00000000-0000-0000-0000-00000000000b', 'tia@exemplo.com', now(), '{}'),
  ('00000000-0000-0000-0000-00000000000c', 'amigo@exemplo.com', now(), '{}'),
  ('00000000-0000-0000-0000-00000000000d', 'estranho@exemplo.com', now(), '{}'),
  ('00000000-0000-0000-0000-00000000000e', 'naoconfirmado@exemplo.com', null, '{}');

create function pg_temp.como(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid, ''), false);
end $$;

create function pg_temp.espera_erro(sql text, trecho text) returns void language plpgsql as $$
begin
  execute sql;
  raise exception 'FALHOU: "%" deveria dar erro "%"', sql, trecho;
exception when others then
  if sqlerrm not like '%' || trecho || '%' then
    raise exception 'FALHOU: "%" deu erro "%" (esperado "%")', sql, sqlerrm, trecho;
  end if;
end $$;

create function pg_temp.confere(ok boolean, msg text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FALHOU: %', msg; end if;
end $$;

grant execute on all functions in schema pg_temp to authenticated, anon;

-- 1) Sem login: nada visível, nenhuma função liberada
select pg_temp.como(null);
set role anon;
select pg_temp.espera_erro('select * from public.membros', 'permission denied');
select pg_temp.espera_erro('select public.entrar_na_familia(null)', 'permission denied');
reset role;

-- 2) Estranho logado antes de existir família: precisa de convite
select pg_temp.como('00000000-0000-0000-0000-00000000000d');
set role authenticated;
select pg_temp.espera_erro('select public.entrar_na_familia(null)', 'convite_necessario');
select pg_temp.espera_erro('select public.criar_convite()', 'somente_admin');
select pg_temp.confere((select count(*) from public.membros) = 0, 'estranho não vê membros');
reset role;

-- 3) Administrador entra no primeiro acesso, sem convite
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select pg_temp.confere((public.entrar_na_familia(null)).papel = 'admin', 'admin entra como admin');
select pg_temp.confere((select nome from public.membros where user_id = auth.uid()) = 'Salvatore', 'nome vem do Google');
select pg_temp.confere((public.entrar_na_familia(null)).papel = 'admin', 'entrar de novo não duplica');
reset role;

-- 4) Admin cria convites
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
set role authenticated;
create temp table cods as
  select (public.criar_convite('membro', 'Tia Rosa')).codigo as membro,
         (public.criar_convite('visitante', 'Amigo')).codigo as visitante,
         (public.criar_convite('membro', 'Vai expirar')).codigo as expira,
         (public.criar_convite('membro', 'Vai cancelar')).codigo as cancela;
select pg_temp.confere((select membro ~ '^[A-HJ-NP-Z2-9]{8}$' from cods), 'formato do código');
select pg_temp.espera_erro('select public.criar_convite(''admin'')', 'papel_invalido');
select pg_temp.confere((select count(*) from public.convites) = 4, 'admin vê os convites');
select public.cancelar_convite((select id from public.convites where para_quem = 'Vai cancelar'));
reset role;
grant select on cods to authenticated;
update public.convites set expira_em = now() - interval '1 minute' where para_quem = 'Vai expirar';

-- 5) Convites inválidos, expirados e cancelados são recusados
select pg_temp.como('00000000-0000-0000-0000-00000000000d');
set role authenticated;
select pg_temp.espera_erro('select public.entrar_na_familia(''ZZZZZZZZ'')', 'convite_invalido');
select pg_temp.espera_erro(format('select public.entrar_na_familia(%L)', (select expira from cods)), 'convite_expirado');
select pg_temp.espera_erro(format('select public.entrar_na_familia(%L)', (select cancela from cods)), 'convite_invalido');
reset role;

-- 6) Tia entra com convite (aceita minúsculas e traço) e ele vira "usado"
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
set role authenticated;
select pg_temp.confere(
  (public.entrar_na_familia(lower(left((select membro from cods), 4) || '-' || right((select membro from cods), 4)))).papel = 'membro',
  'tia entra como membro');
select pg_temp.confere((select count(*) from public.convites) = 0, 'membro comum não vê convites');
select pg_temp.confere((select count(*) from public.membros) = 2, 'membro vê a família');
select pg_temp.espera_erro('select public.criar_convite()', 'somente_admin');
select pg_temp.espera_erro('select public.remover_membro(''00000000-0000-0000-0000-00000000000a'')', 'somente_admin');
-- pode mudar o próprio nome e letras grandes...
update public.membros set nome = 'Tia Rosa', letras_grandes = true where user_id = auth.uid();
select pg_temp.confere((select nome from public.membros where user_id = auth.uid()) = 'Tia Rosa', 'edita o próprio nome');
-- ...mas não o papel, nem o nome dos outros
select pg_temp.espera_erro('update public.membros set papel = ''admin'' where user_id = auth.uid()', 'permission denied');
update public.membros set nome = 'Hackeado' where user_id = '00000000-0000-0000-0000-00000000000a';
select pg_temp.confere((select nome from public.membros where user_id = '00000000-0000-0000-0000-00000000000a') = 'Salvatore', 'não edita os outros');
select pg_temp.espera_erro('delete from public.membros', 'permission denied');
select pg_temp.espera_erro('insert into public.convites (familia_id, codigo) select familia_id, ''ABCDEFGH'' from public.membros limit 1', 'permission denied');
-- termo
select public.aceitar_termo('1.0');
select pg_temp.confere((select termo_versao from public.membros where user_id = auth.uid()) = '1.0', 'termo registrado');
select pg_temp.confere((select count(*) from public.aceites_termo) = 1, 'histórico do aceite');
reset role;

-- 7) Convite já usado não serve para outra pessoa
select pg_temp.como('00000000-0000-0000-0000-00000000000d');
set role authenticated;
select pg_temp.espera_erro(format('select public.entrar_na_familia(%L)', (select membro from cods)), 'convite_usado');
select pg_temp.espera_erro('select public.aceitar_termo(''1.0'')', 'nao_e_da_familia');
reset role;

-- 8) E-mail não confirmado não entra
select pg_temp.como('00000000-0000-0000-0000-00000000000e');
set role authenticated;
select pg_temp.espera_erro(format('select public.entrar_na_familia(%L)', (select visitante from cods)), 'email_nao_confirmado');
reset role;

-- 9) Visitante entra e só vê a si mesmo
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
set role authenticated;
select pg_temp.confere((public.entrar_na_familia((select visitante from cods))).papel = 'visitante', 'visitante entra');
select pg_temp.confere((select count(*) from public.membros) = 1, 'visitante só vê a si mesmo');
reset role;

-- 10) Admin muda papel, remove membro e não pode se excluir
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select pg_temp.confere((select count(*) from public.membros) = 3, 'admin vê todos');
select pg_temp.confere((select count(*) from public.aceites_termo) = 1, 'admin vê aceites');
select public.definir_papel('00000000-0000-0000-0000-00000000000c', 'membro');
select pg_temp.confere((select papel from public.membros where user_id = '00000000-0000-0000-0000-00000000000c') = 'membro', 'papel alterado');
select pg_temp.espera_erro('select public.definir_papel(auth.uid(), ''membro'')', 'nao_pode_alterar_a_si_mesmo');
select pg_temp.espera_erro('select public.definir_papel(''00000000-0000-0000-0000-00000000000c'', ''admin'')', 'papel_invalido');
select public.remover_membro('00000000-0000-0000-0000-00000000000c');
select pg_temp.confere((select count(*) from public.membros) = 2, 'membro removido');
select pg_temp.espera_erro('select public.excluir_minha_conta()', 'admin_nao_pode_excluir');
reset role;

-- 11) Tia exclui a própria conta: login e dados somem
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
set role authenticated;
select public.excluir_minha_conta();
reset role;
select pg_temp.confere(not exists (select 1 from auth.users where id = '00000000-0000-0000-0000-00000000000b'), 'login apagado');
select pg_temp.confere(not exists (select 1 from public.membros where user_id = '00000000-0000-0000-0000-00000000000b'), 'membro apagado');
select pg_temp.confere(not exists (select 1 from public.aceites_termo where user_id = '00000000-0000-0000-0000-00000000000b'), 'aceites apagados');

-- 12) Toda tabela do esquema public tem RLS ligado
select pg_temp.confere(
  not exists (select 1 from pg_tables where schemaname = 'public' and not rowsecurity),
  'RLS ligado em todas as tabelas');

\echo 'Banco: todos os testes passaram.'
