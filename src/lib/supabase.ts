import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Endereço e chave PÚBLICA do Supabase (feita para ficar no navegador; quem protege
// os dados são as regras de acesso do banco). Cadastradas na Cloudflare Pages.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const configurado = Boolean(url && chave);

export const supabase: SupabaseClient | null = configurado
  ? createClient(url!, chave!, {
      auth: {
        persistSession: true, // continua logado ao fechar o app
        autoRefreshToken: true, // renova o acesso sozinho (sessão de meses)
        detectSessionInUrl: true, // volta do "Entrar com Google"
        flowType: 'pkce',
      },
    })
  : null;

export type Papel = 'admin' | 'membro' | 'visitante';

export type Membro = {
  user_id: string;
  familia_id: string;
  papel: Papel;
  nome: string;
  email: string;
  letras_grandes: boolean;
  termo_versao: string | null;
  termo_aceito_em: string | null;
  entrou_em: string;
};

export type Convite = {
  id: string;
  codigo: string;
  papel: Papel;
  para_quem: string | null;
  criado_em: string;
  expira_em: string;
  usado_por: string | null;
  usado_em: string | null;
  cancelado_em: string | null;
};

export const NOMES_PAPEL: Record<Papel, string> = {
  admin: 'Administrador',
  membro: 'Membro',
  visitante: 'Visitante',
};
