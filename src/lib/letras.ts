// Opção "Letras grandes": aumenta todo o texto do app (17px → 21px).
const CHAVE = 'letras-grandes';

export function aplicarLetrasGrandes(ligado: boolean): void {
  document.documentElement.style.fontSize = ligado ? '21px' : '17px';
  try {
    localStorage.setItem(CHAVE, ligado ? '1' : '0');
  } catch {
    /* sem armazenamento */
  }
}

/** Aplica a última escolha logo ao abrir, antes mesmo do login. */
export function aplicarLetrasGuardadas(): void {
  try {
    if (localStorage.getItem(CHAVE) === '1') document.documentElement.style.fontSize = '21px';
  } catch {
    /* sem armazenamento */
  }
}
