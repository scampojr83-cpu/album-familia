// Telas do caminho de entrada depois do login:
// código do convite → termo de privacidade → nome.
import { useState, type FormEvent, type ReactNode } from 'react';
import { supabase, type Membro } from '../lib/supabase';
import { codigoValido, formatarCodigo, guardarCodigoPendente, lerCodigoPendente } from '../lib/convite';
import { TERMO, VERSAO_TERMO } from '../lib/termo';
import { mensagemDeErro } from '../lib/textos';
import { Aviso, Botao, Campo, Cartao } from '../componentes/ui';

function Moldura({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-5 py-10 text-center">
      <img src="/pwa-192.png" alt="" width={80} height={80} className="rounded-[20px] shadow" />
      <h1 className="text-3xl font-bold leading-tight">{titulo}</h1>
      {children}
    </main>
  );
}

export function TelaCodigoConvite({
  email,
  erro,
  semInternet,
  entrar,
  sair,
}: {
  email: string;
  erro: string | null;
  semInternet?: boolean;
  entrar: (codigo: string | null) => Promise<boolean | undefined>;
  sair: () => void;
}) {
  const [codigo, setCodigo] = useState(() => formatarCodigo(lerCodigoPendente() ?? ''));
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    guardarCodigoPendente(codigo);
    await entrar(codigo);
    setOcupado(false);
  }

  if (semInternet) {
    return (
      <Moldura titulo="Sem internet">
        <Cartao>
          <Aviso>Sem internet. Confira a conexão e tente de novo.</Aviso>
          <Botao className="mt-4" onClick={() => entrar(lerCodigoPendente())}>
            Tentar de novo
          </Botao>
        </Cartao>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Falta só o convite">
      <Cartao>
        <form onSubmit={enviar} className="space-y-4">
          <p className="text-lg text-apagado">
            Digite o código de 8 letras e números que veio na mensagem do convite.
          </p>
          {erro && <Aviso>{erro}</Aviso>}
          <Campo
            rotulo="Código do convite"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={codigo}
            onChange={(e) => setCodigo(formatarCodigo(e.target.value).slice(0, 9))}
            placeholder="ABCD-EFGH"
            className="text-center text-2xl tracking-widest uppercase"
          />
          <Botao type="submit" carregando={ocupado} disabled={!codigoValido(codigo)}>
            Entrar na família
          </Botao>
        </form>
      </Cartao>
      <p className="text-apagado">
        Você entrou como <strong className="text-tinta">{email}</strong>.
      </p>
      <Botao variante="secundario" onClick={sair}>
        Sair e usar outra conta
      </Botao>
    </Moldura>
  );
}

export function TextoTermo() {
  return (
    <div className="space-y-4">
      {TERMO.map((t) => (
        <div key={t.titulo}>
          <h3 className="text-lg font-semibold">{t.titulo}</h3>
          <p className="mt-1 text-apagado">{t.texto}</p>
        </div>
      ))}
    </div>
  );
}

export function TelaTermo({
  membro,
  aoAceitar,
  sair,
}: {
  membro: Membro;
  aoAceitar: (m: Membro) => void;
  sair: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [recusou, setRecusou] = useState(false);

  async function aceitar() {
    if (!supabase) return;
    setOcupado(true);
    setErro(null);
    const { error } = await supabase.rpc('aceitar_termo', { p_versao: VERSAO_TERMO });
    setOcupado(false);
    if (error) return setErro(mensagemDeErro(error));
    aoAceitar({ ...membro, termo_versao: VERSAO_TERMO, termo_aceito_em: new Date().toISOString() });
  }

  return (
    <Moldura titulo="Sua privacidade">
      <p className="text-lg text-apagado">Antes de começar, leia como cuidamos dos seus dados.</p>
      <Cartao>
        <TextoTermo />
      </Cartao>
      {erro && <Aviso>{erro}</Aviso>}
      {recusou ? (
        <Cartao>
          <p className="text-lg">
            Sem aceitar o termo não é possível usar o álbum. Se tiver dúvidas, fale com o
            administrador da família.
          </p>
          <Botao className="mt-4" onClick={() => setRecusou(false)}>
            Voltar ao termo
          </Botao>
          <Botao variante="secundario" className="mt-3" onClick={sair}>
            Sair
          </Botao>
        </Cartao>
      ) : (
        <div className="w-full space-y-3">
          <Botao onClick={aceitar} carregando={ocupado}>
            Li e aceito
          </Botao>
          <Botao variante="secundario" onClick={() => setRecusou(true)}>
            Não aceito
          </Botao>
        </div>
      )}
    </Moldura>
  );
}

export function TelaSeuNome({ membro, aoSalvar }: { membro: Membro; aoSalvar: (m: Membro) => void }) {
  const [nome, setNome] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const limpo = nome.trim().slice(0, 60);
    if (!limpo) return;
    setOcupado(true);
    const { error } = await supabase.from('membros').update({ nome: limpo }).eq('user_id', membro.user_id);
    setOcupado(false);
    if (error) return setErro(mensagemDeErro(error));
    aoSalvar({ ...membro, nome: limpo });
  }

  return (
    <Moldura titulo="Como a família te chama?">
      <Cartao>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <Aviso>{erro}</Aviso>}
          <Campo
            rotulo="Seu nome ou apelido"
            dica='Ex.: "Vó Maria", "Tio Zé", "Ana"'
            autoComplete="nickname"
            value={nome}
            maxLength={60}
            onChange={(e) => setNome(e.target.value)}
          />
          <Botao type="submit" carregando={ocupado} disabled={!nome.trim()}>
            Continuar
          </Botao>
        </form>
      </Cartao>
    </Moldura>
  );
}
