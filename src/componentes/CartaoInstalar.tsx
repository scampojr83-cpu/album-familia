import { useEffect, useState } from 'react';
import { detectarSituacao, type Situacao } from '../instalacao';
import { Botao, Cartao } from './ui';

type EventoInstalar = Event & { prompt: () => Promise<void> };

/** Instrução certa para instalar o app em cada celular. Some quando já está instalado. */
export default function CartaoInstalar({ mostrarInstalado = false }: { mostrarInstalado?: boolean }) {
  const [situacao] = useState<Situacao>(() => detectarSituacao());
  const [eventoInstalar, setEventoInstalar] = useState<EventoInstalar | null>(null);
  const [instalado, setInstalado] = useState(situacao === 'instalado');

  useEffect(() => {
    const aoPoderInstalar = (e: Event) => {
      e.preventDefault();
      setEventoInstalar(e as EventoInstalar);
    };
    const aoInstalar = () => {
      setInstalado(true);
      setEventoInstalar(null);
    };
    window.addEventListener('beforeinstallprompt', aoPoderInstalar);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoderInstalar);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  if (instalado && !mostrarInstalado) return null;

  return (
    <Cartao>
      {instalado ? (
        <>
          <h2 className="text-xl font-semibold">Tudo certo!</h2>
          <p className="mt-2 text-apagado">
            O app está instalado neste celular. Daqui pra frente, é só tocar no ícone do álbum na
            tela inicial.
          </p>
        </>
      ) : situacao === 'iphone-outro-navegador' ? (
        <>
          <h2 className="text-xl font-semibold">Abra no Safari</h2>
          <p className="mt-2 text-apagado">
            No iPhone, o app só pode ser instalado pelo <strong>Safari</strong>. Copie este link e
            abra no Safari.
          </p>
        </>
      ) : situacao === 'iphone-safari' ? (
        <>
          <h2 className="text-xl font-semibold">Instale no seu iPhone</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-apagado">
            <li>
              Toque em <strong>Compartilhar</strong> (o quadrado com uma seta para cima).
            </li>
            <li>
              Toque em <strong>Adicionar à Tela de Início</strong>.
            </li>
            <li>
              Toque em <strong>Adicionar</strong>. Depois, abra o app pelo ícone.
            </li>
          </ol>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold">Instale no seu celular</h2>
          {eventoInstalar ? (
            <Botao className="mt-4" onClick={() => eventoInstalar.prompt()}>
              Instalar app
            </Botao>
          ) : (
            <p className="mt-2 text-apagado">
              Toque no menu <strong>⋮</strong> do Chrome e escolha <strong>Instalar app</strong>{' '}
              (ou <strong>Adicionar à tela inicial</strong>).
            </p>
          )}
        </>
      )}
    </Cartao>
  );
}
