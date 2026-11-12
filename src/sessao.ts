// Cuida do login e de saber se a pessoa já faz parte da família.
import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Membro } from './lib/supabase';
import { limparCodigoPendente, lerCodigoPendente } from './lib/convite';
import { mensagemDeErro } from './lib/textos';
import { aplicarLetrasGrandes } from './lib/letras';

export type EstadoSessao =
  | { etapa: 'carregando' }
  | { etapa: 'sem-login' }
  | { etapa: 'sem-familia'; email: string; erro: string | null; semInternet?: boolean }
  | { etapa: 'pronto'; membro: Membro };

export function useSessao() {
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined);
  const [estado, setEstado] = useState<EstadoSessao>({ etapa: 'carregando' });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSessao(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const entrar = useCallback(async (codigo: string | null) => {
    if (!supabase) return;
    const { data: u } = await supabase.auth.getUser();
    const email = u.user?.email ?? '';
    const { data, error } = await supabase.rpc('entrar_na_familia', { codigo_convite: codigo });
    if (error) {
      const msg = mensagemDeErro(error);
      const semInternet = msg.startsWith('Sem internet');
      // Código guardado que não serve mais: esquece, para a pessoa digitar outro.
      if (!semInternet) limparCodigoPendente();
      setEstado({
        etapa: 'sem-familia',
        email,
        erro: error.message.includes('convite_necessario') ? null : msg,
        semInternet,
      });
      return false;
    }
    limparCodigoPendente();
    const membro = data as Membro;
    aplicarLetrasGrandes(membro.letras_grandes);
    setEstado({ etapa: 'pronto', membro });
    return true;
  }, []);

  const idUsuario = sessao?.user.id;
  const sessaoLida = sessao !== undefined;
  useEffect(() => {
    if (!sessaoLida) return;
    if (!idUsuario) {
      setEstado({ etapa: 'sem-login' });
      return;
    }
    setEstado({ etapa: 'carregando' });
    void entrar(lerCodigoPendente());
  }, [idUsuario, sessaoLida, entrar]);

  const atualizarMembro = useCallback((m: Membro) => {
    aplicarLetrasGrandes(m.letras_grandes);
    setEstado({ etapa: 'pronto', membro: m });
  }, []);

  const sair = useCallback(async () => {
    await supabase?.auth.signOut();
    setEstado({ etapa: 'sem-login' });
  }, []);

  return { estado, entrar, atualizarMembro, sair };
}
