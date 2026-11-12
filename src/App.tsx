import { useState } from 'react';
import { configurado, type Membro } from './lib/supabase';
import { codigoDaUrl, guardarCodigoPendente, lerCodigoPendente } from './lib/convite';
import { precisaAceitarTermo } from './lib/termo';
import { useSessao } from './sessao';
import CartaoInstalar from './componentes/CartaoInstalar';
import { Carregando, Cartao } from './componentes/ui';
import Entrar from './telas/Entrar';
import { TelaCodigoConvite, TelaSeuNome, TelaTermo } from './telas/BoasVindas';
import Perfil from './telas/Perfil';
import Familia from './telas/Familia';

// Ao abrir um link /convite/ABCD-EFGH: guarda o código e limpa o endereço.
function lerConviteDaUrl(): string | null {
  const codigo = codigoDaUrl(window.location.pathname);
  if (codigo) {
    guardarCodigoPendente(codigo);
    window.history.replaceState(null, '', '/');
  }
  return codigo ?? lerCodigoPendente();
}

export default function App() {
  const [codigoConvite] = useState(lerConviteDaUrl);
  if (!configurado) return <ConfiguracaoPendente />;
  return <AppConectado codigoConvite={codigoConvite} />;
}

function AppConectado({ codigoConvite }: { codigoConvite: string | null }) {
  const { estado, entrar, atualizarMembro, sair } = useSessao();

  switch (estado.etapa) {
    case 'carregando':
      return <Carregando />;
    case 'sem-login':
      return <Entrar codigoConvite={codigoConvite} />;
    case 'sem-familia':
      return (
        <TelaCodigoConvite
          key={estado.erro ?? ''}
          email={estado.email}
          erro={estado.erro}
          semInternet={estado.semInternet}
          entrar={entrar}
          sair={sair}
        />
      );
    case 'pronto': {
      const m = estado.membro;
      if (precisaAceitarTermo(m.termo_versao))
        return <TelaTermo membro={m} aoAceitar={atualizarMembro} sair={sair} />;
      if (!m.nome.trim()) return <TelaSeuNome membro={m} aoSalvar={atualizarMembro} />;
      return <Principal membro={m} atualizarMembro={atualizarMembro} sair={sair} />;
    }
  }
}

type Aba = 'inicio' | 'familia' | 'perfil';

function Principal({
  membro,
  atualizarMembro,
  sair,
}: {
  membro: Membro;
  atualizarMembro: (m: Membro) => void;
  sair: () => void;
}) {
  const [aba, setAba] = useState<Aba>('inicio');
  const abas: { id: Aba; icone: string; nome: string }[] = [
    { id: 'inicio', icone: '🏠', nome: 'Início' },
    ...(membro.papel === 'admin' ? [{ id: 'familia' as const, icone: '👪', nome: 'Família' }] : []),
    { id: 'perfil', icone: '👤', nome: 'Perfil' },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-md flex-1 px-5 pt-8 pb-32">
        {aba === 'inicio' && <Inicio membro={membro} />}
        {aba === 'familia' && membro.papel === 'admin' && <Familia eu={membro} />}
        {aba === 'perfil' && <Perfil membro={membro} aoMudar={atualizarMembro} sair={sair} />}
      </main>
      <nav
        aria-label="Abas"
        className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-md">
          {abas.map((a) => (
            <li key={a.id} className="flex-1">
              <button
                type="button"
                onClick={() => setAba(a.id)}
                aria-current={aba === a.id ? 'page' : undefined}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-0.5 text-base ${
                  aba === a.id ? 'font-bold text-terracota' : 'text-apagado'
                }`}
              >
                <span aria-hidden="true" className="text-2xl">
                  {a.icone}
                </span>
                {a.nome}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Inicio({ membro }: { membro: Membro }) {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Olá, {membro.nome}!</h1>
      <Cartao>
        <h2 className="text-xl font-semibold">Você já faz parte do álbum</h2>
        <p className="mt-2 text-apagado">
          Em breve as fotos da família vão aparecer aqui. O envio de fotos chega na próxima versão
          do app.
        </p>
      </Cartao>
      <CartaoInstalar />
      <p className="pt-4 text-center text-sm text-apagado">Versão {__VERSAO__} · Fase 1</p>
    </div>
  );
}

function ConfiguracaoPendente() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-5 py-10 text-center">
      <img src="/pwa-192.png" alt="" width={112} height={112} className="rounded-[26px] shadow-lg" />
      <h1 className="text-3xl font-bold leading-tight">Bem-vindos à família</h1>
      <p className="text-lg text-apagado">
        O <strong className="text-tinta">Álbum Familiar</strong> está sendo preparado. Em breve você
        poderá entrar por aqui.
      </p>
      <CartaoInstalar mostrarInstalado />
      <p className="mt-auto text-sm text-apagado">Versão {__VERSAO__} · aguardando configuração</p>
    </main>
  );
}
