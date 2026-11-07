import { useEffect, useState } from 'react';
import { detectarSituacao, type Situacao } from './instalacao';

type EventoInstalar = Event & { prompt: () => Promise<void> };

export default function App() {
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

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 py-10 text-center">
      <img
        src="/pwa-192.png"
        alt=""
        width={112}
        height={112}
        className="rounded-[26px] shadow-lg"
      />
      <h1 className="mt-6 text-3xl font-bold leading-tight">Bem-vindos à família</h1>
      <p className="mt-3 text-lg text-apagado">
        Este é o <strong className="text-tinta">Álbum Familiar</strong>: o lugar onde vamos
        guardar e reviver as fotos da nossa família.
      </p>

      <section className="mt-8 w-full rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm">
        {instalado ? (
          <>
            <h2 className="text-xl font-semibold">Tudo certo!</h2>
            <p className="mt-2 text-apagado">
              O app está instalado neste celular. Daqui pra frente, é só tocar no ícone do
              álbum na tela inicial.
            </p>
          </>
        ) : situacao === 'iphone-outro-navegador' ? (
          <>
            <h2 className="text-xl font-semibold">Abra no Safari</h2>
            <p className="mt-2 text-apagado">
              No iPhone, o app só pode ser instalado pelo <strong>Safari</strong>. Copie este
              link e abra no Safari.
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
              <button
                type="button"
                onClick={() => eventoInstalar.prompt()}
                className="mt-4 min-h-14 w-full rounded-xl bg-terracota px-5 text-lg font-semibold text-white active:bg-terracota-escuro"
              >
                Instalar app
              </button>
            ) : (
              <p className="mt-2 text-apagado">
                Toque no menu <strong>⋮</strong> do Chrome e escolha{' '}
                <strong>Instalar app</strong> (ou <strong>Adicionar à tela inicial</strong>).
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-auto pt-10 text-sm text-apagado">Versão {__VERSAO__} · Fase 0</p>
    </main>
  );
}
