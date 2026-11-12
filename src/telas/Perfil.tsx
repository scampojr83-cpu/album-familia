import { useState } from 'react';
import { NOMES_PAPEL, supabase, type Membro } from '../lib/supabase';
import { formatarData, mensagemDeErro } from '../lib/textos';
import { Aviso, Botao, Campo, Cartao } from '../componentes/ui';
import { TextoTermo } from './BoasVindas';

export default function Perfil({
  membro,
  aoMudar,
  sair,
}: {
  membro: Membro;
  aoMudar: (m: Membro) => void;
  sair: () => void;
}) {
  const [nome, setNome] = useState(membro.nome);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [verTermo, setVerTermo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  async function salvar(campos: Partial<Pick<Membro, 'nome' | 'letras_grandes'>>, msgOk: string) {
    if (!supabase) return;
    setOcupado(true);
    setAviso(null);
    const { error } = await supabase.from('membros').update(campos).eq('user_id', membro.user_id);
    setOcupado(false);
    if (error) return setAviso({ tipo: 'erro', texto: mensagemDeErro(error) });
    aoMudar({ ...membro, ...campos });
    setAviso({ tipo: 'ok', texto: msgOk });
  }

  async function excluirConta() {
    if (!supabase) return;
    setOcupado(true);
    const { error } = await supabase.rpc('excluir_minha_conta');
    if (error) {
      setOcupado(false);
      return setAviso({ tipo: 'erro', texto: mensagemDeErro(error) });
    }
    sair();
  }

  const ehAdmin = membro.papel === 'admin';

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Perfil</h1>
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

      <Cartao className="space-y-4">
        <Campo rotulo="Seu nome" value={nome} maxLength={60} onChange={(e) => setNome(e.target.value)} />
        <Botao
          variante="secundario"
          disabled={!nome.trim() || nome.trim() === membro.nome}
          carregando={ocupado}
          onClick={() => salvar({ nome: nome.trim() }, 'Nome salvo.')}
        >
          Salvar nome
        </Botao>
      </Cartao>

      <Cartao>
        <button
          type="button"
          role="switch"
          aria-checked={membro.letras_grandes}
          disabled={ocupado}
          onClick={() =>
            salvar(
              { letras_grandes: !membro.letras_grandes },
              membro.letras_grandes ? 'Letras grandes desligadas.' : 'Letras grandes ligadas.'
            )
          }
          className="flex min-h-14 w-full items-center justify-between gap-4 text-left"
        >
          <span>
            <span className="block text-lg font-semibold">Letras grandes</span>
            <span className="block text-apagado">Aumenta o tamanho de todo o texto do app.</span>
          </span>
          <span
            aria-hidden="true"
            className={`flex h-9 w-16 shrink-0 items-center rounded-full p-1 transition ${
              membro.letras_grandes ? 'justify-end bg-terracota' : 'justify-start bg-tinta/25'
            }`}
          >
            <span className="h-7 w-7 rounded-full bg-white shadow" />
          </span>
        </button>
        <p className="mt-1 font-semibold">{membro.letras_grandes ? 'Ligado' : 'Desligado'}</p>
      </Cartao>

      <Cartao>
        <dl className="space-y-2">
          <div>
            <dt className="text-apagado">E-mail</dt>
            <dd className="text-lg [overflow-wrap:anywhere]">{membro.email}</dd>
          </div>
          <div>
            <dt className="text-apagado">Papel</dt>
            <dd className="text-lg">{NOMES_PAPEL[membro.papel]}</dd>
          </div>
          <div>
            <dt className="text-apagado">Na família desde</dt>
            <dd className="text-lg">{formatarData(membro.entrou_em)}</dd>
          </div>
          {membro.termo_aceito_em && (
            <div>
              <dt className="text-apagado">Termo de privacidade aceito em</dt>
              <dd className="text-lg">{formatarData(membro.termo_aceito_em)}</dd>
            </div>
          )}
        </dl>
        <Botao variante="leve" className="mt-2" onClick={() => setVerTermo((v) => !v)}>
          {verTermo ? 'Fechar o termo de privacidade' : 'Ler o termo de privacidade'}
        </Botao>
        {verTermo && (
          <div className="mt-3">
            <TextoTermo />
          </div>
        )}
      </Cartao>

      <Botao variante="secundario" onClick={sair}>
        Sair deste celular
      </Botao>

      <Cartao>
        <h2 className="text-xl font-semibold">Excluir minha conta e meus dados</h2>
        {ehAdmin ? (
          <p className="mt-2 text-apagado">
            A conta do administrador não pode ser excluída pelo app.
          </p>
        ) : !confirmarExclusao ? (
          <>
            <p className="mt-2 text-apagado">
              Apaga seu acesso e seus dados do álbum. Não dá para desfazer.
            </p>
            <Botao variante="perigo" className="mt-4" onClick={() => setConfirmarExclusao(true)}>
              Excluir minha conta
            </Botao>
          </>
        ) : (
          <>
            <Aviso>Tem certeza? Sua conta e seus dados serão apagados para sempre.</Aviso>
            <Botao variante="perigo" className="mt-4" carregando={ocupado} onClick={excluirConta}>
              Sim, excluir tudo
            </Botao>
            <Botao variante="secundario" className="mt-3" onClick={() => setConfirmarExclusao(false)}>
              Não, voltar
            </Botao>
          </>
        )}
      </Cartao>
    </div>
  );
}
