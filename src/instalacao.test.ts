import { describe, expect, it } from 'vitest';
import { detectarSituacao } from './instalacao';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1';
const S23 =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';

describe('detectarSituacao', () => {
  it('reconhece o app já instalado', () => {
    expect(detectarSituacao(S23, true)).toBe('instalado');
  });
  it('reconhece iPhone no Safari', () => {
    expect(detectarSituacao(IPHONE_SAFARI, false)).toBe('iphone-safari');
  });
  it('pede o Safari quando o iPhone usa outro navegador', () => {
    expect(detectarSituacao(IPHONE_CHROME, false)).toBe('iphone-outro-navegador');
  });
  it('reconhece Android (Samsung S23 Ultra)', () => {
    expect(detectarSituacao(S23, false)).toBe('android');
  });
});
