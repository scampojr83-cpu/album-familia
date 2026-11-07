// Descobre em que situação o app está aberto, para mostrar a instrução certa.

export type Situacao =
  | 'instalado' // já aberto pelo ícone da tela inicial
  | 'iphone-safari' // iPhone no Safari: instalar por Compartilhar → Adicionar à Tela de Início
  | 'iphone-outro-navegador' // iPhone fora do Safari: precisa abrir no Safari
  | 'android' // Android ou computador: botão "Instalar app"
  | 'outro';

export function detectarSituacao(
  ua: string = navigator.userAgent,
  standalone: boolean = estaInstalado()
): Situacao {
  if (standalone) return 'instalado';
  const iphone = /iPhone|iPad|iPod/i.test(ua);
  if (iphone) {
    const outroNavegador = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//i.test(ua);
    return outroNavegador ? 'iphone-outro-navegador' : 'iphone-safari';
  }
  if (/Android/i.test(ua)) return 'android';
  return 'outro';
}

function estaInstalado(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
}
