// Códigos de convite: 8 letras/números, sem os confusos (I, O, 0, 1).
// Mostrados como ABCD-EFGH para facilitar ditar ou digitar.

const VALIDO = /^[A-HJ-NP-Z2-9]{8}$/;
const CHAVE = 'convite-pendente';

export function normalizarCodigo(texto: string): string {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function codigoValido(texto: string): boolean {
  return VALIDO.test(normalizarCodigo(texto));
}

export function formatarCodigo(texto: string): string {
  const c = normalizarCodigo(texto);
  return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4, 8)}` : c;
}

/** Lê o código de um endereço do tipo /convite/ABCD-EFGH. */
export function codigoDaUrl(pathname: string): string | null {
  const m = pathname.match(/^\/convite\/([^/?#]+)/i);
  if (!m) return null;
  const c = normalizarCodigo(decodeURIComponent(m[1]));
  return VALIDO.test(c) ? c : null;
}

export function linkDoConvite(origem: string, codigo: string): string {
  return `${origem}/convite/${formatarCodigo(codigo)}`;
}

export function mensagemDoConvite(origem: string, codigo: string, paraQuem?: string | null): string {
  const saudacao = paraQuem ? `Oi, ${paraQuem}!` : 'Oi!';
  return [
    `${saudacao} Você foi convidado(a) para o Álbum Familiar, o álbum de fotos da nossa família.`,
    '',
    `1. Abra este link: ${linkDoConvite(origem, codigo)}`,
    '2. Siga as instruções para instalar o app.',
    `3. Se o app pedir, digite o código: ${formatarCodigo(codigo)}`,
    '',
    'O convite vale por 7 dias e só pode ser usado uma vez.',
  ].join('\n');
}

export function guardarCodigoPendente(codigo: string): void {
  try {
    localStorage.setItem(CHAVE, normalizarCodigo(codigo));
  } catch {
    /* sem armazenamento: o código será digitado */
  }
}

export function lerCodigoPendente(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function limparCodigoPendente(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a fazer */
  }
}
