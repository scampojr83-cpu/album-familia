import { describe, expect, it } from 'vitest';
import { formatarData, mensagemDeErro } from './textos';
import { precisaAceitarTermo, VERSAO_TERMO } from './termo';

describe('datas', () => {
  it('usa dd/mm/aaaa no fuso de São Paulo', () => {
    // 02:00 UTC do dia 1º ainda é dia 31 em São Paulo
    expect(formatarData('2026-01-01T02:00:00Z')).toBe('31/12/2025');
    expect(formatarData('2026-11-12T15:00:00Z')).toBe('12/11/2026');
  });
});

describe('mensagens de erro', () => {
  it('traduz erros do banco', () => {
    expect(mensagemDeErro({ message: 'convite_expirado' })).toContain('venceu');
    expect(mensagemDeErro({ message: 'convite_usado' })).toContain('já foi usado');
  });
  it('traduz erros do login', () => {
    expect(mensagemDeErro({ message: 'Token has expired or is invalid' })).toContain('Código errado');
    expect(mensagemDeErro({ message: 'Failed to fetch' })).toContain('Sem internet');
    expect(mensagemDeErro({ message: 'email rate limit exceeded' })).toContain('Muitas tentativas');
  });
  it('nunca mostra texto técnico', () => {
    expect(mensagemDeErro({ message: 'xyz 500' })).toBe('Algo deu errado. Tente de novo em instantes.');
  });
});

describe('termo de privacidade', () => {
  it('pede aceite quando a versão mudou', () => {
    expect(precisaAceitarTermo(null)).toBe(true);
    expect(precisaAceitarTermo('0.9')).toBe(true);
    expect(precisaAceitarTermo(VERSAO_TERMO)).toBe(false);
  });
});
