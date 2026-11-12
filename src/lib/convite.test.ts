import { describe, expect, it } from 'vitest';
import { codigoDaUrl, codigoValido, formatarCodigo, linkDoConvite, mensagemDoConvite, normalizarCodigo } from './convite';

describe('códigos de convite', () => {
  it('normaliza o que a pessoa digita', () => {
    expect(normalizarCodigo(' abcd-efgh ')).toBe('ABCDEFGH');
  });
  it('mostra com traço no meio', () => {
    expect(formatarCodigo('abcdefgh')).toBe('ABCD-EFGH');
    expect(formatarCodigo('abc')).toBe('ABC');
  });
  it('recusa letras confusas (I, O, 0, 1) e tamanho errado', () => {
    expect(codigoValido('ABCD-EFGH')).toBe(true);
    expect(codigoValido('ABCD-EFG0')).toBe(false);
    expect(codigoValido('ABCD-EFGI')).toBe(false);
    expect(codigoValido('ABCDEFG')).toBe(false);
  });
  it('lê o código do link', () => {
    expect(codigoDaUrl('/convite/ABCD-EFGH')).toBe('ABCDEFGH');
    expect(codigoDaUrl('/convite/abcdefgh')).toBe('ABCDEFGH');
    expect(codigoDaUrl('/convite/XX')).toBeNull();
    expect(codigoDaUrl('/')).toBeNull();
  });
  it('monta link e mensagem do WhatsApp', () => {
    const link = linkDoConvite('https://album.dev', 'ABCDEFGH');
    expect(link).toBe('https://album.dev/convite/ABCD-EFGH');
    const msg = mensagemDoConvite('https://album.dev', 'ABCDEFGH', 'Tia Rosa');
    expect(msg).toContain('Oi, Tia Rosa!');
    expect(msg).toContain(link);
    expect(msg).toContain('ABCD-EFGH');
  });
});
