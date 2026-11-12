// Datas no padrão brasileiro e mensagens de erro em português simples.

export function formatarData(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

const ERROS: Record<string, string> = {
  convite_necessario: 'Para entrar, você precisa de um convite. Peça um ao administrador da família.',
  convite_invalido: 'Este código de convite não existe ou foi cancelado. Confira as letras ou peça um novo.',
  convite_usado: 'Este convite já foi usado. Cada convite serve para uma pessoa só. Peça um novo.',
  convite_expirado: 'Este convite venceu (vale 7 dias). Peça um novo ao administrador.',
  email_nao_confirmado: 'Seu e-mail ainda não foi confirmado. Entre de novo com o código do e-mail.',
  somente_admin: 'Só o administrador pode fazer isso.',
  nao_pode_alterar_a_si_mesmo: 'Você não pode alterar a sua própria conta por aqui.',
  admin_nao_pode_excluir: 'A conta do administrador não pode ser excluída por aqui.',
  nao_e_da_familia: 'Sua conta ainda não faz parte da família.',
};

export function mensagemDeErro(erro: unknown): string {
  const texto =
    typeof erro === 'string'
      ? erro
      : erro && typeof erro === 'object' && 'message' in erro
        ? String((erro as { message: unknown }).message)
        : '';
  for (const [codigo, msg] of Object.entries(ERROS)) {
    if (texto.includes(codigo)) return msg;
  }
  const t = texto.toLowerCase();
  if (t.includes('failed to fetch') || t.includes('network') || t.includes('load failed'))
    return 'Sem internet. Confira a conexão e tente de novo.';
  if (t.includes('expired') || t.includes('invalid') && t.includes('token'))
    return 'Código errado ou vencido. Confira os 6 números ou peça um novo código.';
  if (t.includes('rate limit') || t.includes('security purposes') || t.includes('too many'))
    return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.';
  if (t.includes('email') && t.includes('invalid'))
    return 'Este e-mail não parece certo. Confira e tente de novo.';
  return 'Algo deu errado. Tente de novo em instantes.';
}
