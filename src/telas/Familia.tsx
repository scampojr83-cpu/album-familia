// Tela do administrador: convidar parentes e cuidar de quem está na família.
import { useCallback, useEffect, useState } from 'react';
import { NOMES_PAPEL, supabase, type Convite, type Membro, type Papel } from '../lib/supabase';
import { formatarCodigo, linkDoConvite, mensagemDoConvite } from '../lib/convite';
import { formatarData, mensagemDeErro } from '../lib/textos';
import { Aviso, Botao, Campo, Cartao } from '../componentes/ui';

const ORIGEM = typeof window !== 'undefined' ? window.location.origin : '';

async function compartilhar(c: Convite): Promise<'compartilhado' | 'copiado' | 'whatsapp'> {
  const texto = mensagemDoConvite(ORIGEM, c.codigo, c.para_quem);
  if (navigator.share) {
    try {
      await navigator.share({ text: texto });
      return 'compartilhado';
    } catch {
      /* pessoa fechou a janela de compartilhar */
      return 'compartilhado';
    }
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    return 'whatsapp';
  }
}

export default function Familia({ eu }: { eu: Membro }) {
  const [convites, setConvites] = useState<Convite[] | null>(null);
  const [membros, setMembros] = useState<Membro[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [paraQuem, setParaQuem] = useState('');
  const [papel, setPapel] = useState<Papel>('membro');
  const [novo, setNovo] = useState<Convite | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!supabase) return;
    const agora = new Date().toISOString();
    const [c, m] = await Promise.all([
      supabase
        .from('convites')
        .select('*')
        .is('usado_em', null)
        .is('cancelado_em', null)
        .gt('expira_em', agora)
        .order('criado_em', { ascending: false }),
      supabase.from('membros').select('*').order('entrou_em'),
    ]);
    if (c.error || m.error) {
      setErro(mensagemDeErro(c.error ?? m.error));
      return;
    }
    setErro(null);
    setConvites(c.data as Convite[]);
    setMembros(m.data as Membro[]);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function acao(fn: () => PromiseLike<{ error: unknown }>, ok?: string) {
    setOcupado(true);
    setAviso(null);
    const { error } = await fn();
    setOcupado(false);
    if (error) {
      setErro(mensagemDeErro(error));
      return false;
    }
    setErro(null);
    if (ok) setAviso(ok);
    await carregar();
    return true;
  }

  async function criar() {
    if (!supabase) return;
    setOcupado(true);
    setAviso(null);
    const { data, error } = await supabase.rpc('criar_convite', { p_papel: papel, p_para_quem: paraQuem });
    setOcupado(false);
    if (error) return setErro(mensagemDeErro(error));
    setNovo(data as Convite);
    setParaQuem('');
    await carregar();
  }

  async function enviar(c: Convite) {
    const r = await compartilhar(c);
    if (r === 'copiado') setAviso('Mensagem copiada. Cole no WhatsApp da pessoa.');
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Família</h1>
      {erro && <Aviso>{erro}</Aviso>}
      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}

      <Cartao className="space-y-4">
        <h2 className="text-xl font-semibold">Convidar alguém</h2>
        <Campo
          rotulo="Para quem é o convite?"
          dica="Opcional. Ajuda você a lembrar depois."
          value={paraQuem}
          maxLength={60}
          onChange={(e) => setParaQuem(e.target.value)}
          placeholder="Ex.: Tia Rosa"
        />
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">Tipo de acesso</legend>
          {(
            [
              ['membro', 'Membro da família', 'Vê tudo, envia fotos, comenta.'],
              ['visitante', 'Visitante', 'Vê só os álbuns liberados para ele (ex.: amigos).'],
            ] as const
          ).map(([valor, titulo, desc]) => (
            <label
              key={valor}
              className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${
                papel === valor ? 'border-terracota bg-terracota/5' : 'border-tinta/15'
              }`}
            >
              <input
                type="radio"
                name="papel"
                value={valor}
                checked={papel === valor}
                onChange={() => setPapel(valor)}
                className="mt-1 h-6 w-6 accent-terracota"
              />
              <span>
                <span className="block text-lg font-semibold">{titulo}</span>
                <span className="block text-apagado">{desc}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <Botao onClick={criar} carregando={ocupado}>
          Criar convite
        </Botao>
      </Cartao>

      {novo && (
        <Cartao className="space-y-3 border-2 border-verde">
          <h2 className="text-xl font-semibold">Convite criado!</h2>
          <p className="text-apagado">
            Código: <strong className="text-2xl tracking-wider text-tinta">{formatarCodigo(novo.codigo)}</strong>
          </p>
          <p className="[overflow-wrap:anywhere] text-apagado">{linkDoConvite(ORIGEM, novo.codigo)}</p>
          <p className="text-apagado">Vale até {formatarData(novo.expira_em)} e serve para uma pessoa só.</p>
          <Botao onClick={() => enviar(novo)}>Enviar convite (WhatsApp e outros)</Botao>
          <Botao variante="leve" onClick={() => setNovo(null)}>
            Fechar
          </Botao>
        </Cartao>
      )}

      <Cartao>
        <h2 className="text-xl font-semibold">Convites em aberto</h2>
        {convites === null && !erro ? (
          <p className="mt-2 text-apagado">Carregando…</p>
        ) : !convites?.length ? (
          <p className="mt-2 text-apagado">Nenhum convite esperando resposta.</p>
        ) : (
          <ul className="mt-3 divide-y divide-black/10">
            {convites.map((c) => (
              <li key={c.id} className="space-y-3 py-4">
                <p className="text-lg">
                  <strong>{c.para_quem || 'Sem nome'}</strong> · {NOMES_PAPEL[c.papel]}
                </p>
                <p className="text-apagado">
                  Código {formatarCodigo(c.codigo)} · vale até {formatarData(c.expira_em)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Botao variante="secundario" onClick={() => enviar(c)}>
                    Enviar
                  </Botao>
                  <Botao
                    variante="perigo"
                    disabled={ocupado}
                    onClick={() =>
                      acao(() => supabase!.rpc('cancelar_convite', { p_convite: c.id }), 'Convite cancelado.')
                    }
                  >
                    Cancelar
                  </Botao>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <Cartao>
        <h2 className="text-xl font-semibold">Quem está na família</h2>
        {membros === null && !erro ? (
          <p className="mt-2 text-apagado">Carregando…</p>
        ) : (
          <ul className="mt-3 divide-y divide-black/10">
            {membros?.map((m) => (
              <li key={m.user_id} className="space-y-3 py-4">
                <p className="text-lg">
                  <strong>{m.nome || 'Sem nome ainda'}</strong>
                  {m.user_id === eu.user_id && ' (você)'}
                </p>
                <p className="[overflow-wrap:anywhere] text-apagado">
                  {m.email} · {NOMES_PAPEL[m.papel]} · desde {formatarData(m.entrou_em)}
                </p>
                {m.user_id !== eu.user_id &&
                  (removendo === m.user_id ? (
                    <div className="space-y-3">
                      <Aviso>Remover {m.nome || m.email} da família? A pessoa perde o acesso.</Aviso>
                      <div className="grid grid-cols-2 gap-3">
                        <Botao
                          variante="perigo"
                          carregando={ocupado}
                          onClick={async () => {
                            await acao(() => supabase!.rpc('remover_membro', { p_user: m.user_id }), 'Pessoa removida.');
                            setRemovendo(null);
                          }}
                        >
                          Sim, remover
                        </Botao>
                        <Botao variante="secundario" onClick={() => setRemovendo(null)}>
                          Voltar
                        </Botao>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Botao
                        variante="secundario"
                        disabled={ocupado}
                        onClick={() =>
                          acao(
                            () =>
                              supabase!.rpc('definir_papel', {
                                p_user: m.user_id,
                                p_papel: m.papel === 'visitante' ? 'membro' : 'visitante',
                              }),
                            'Tipo de acesso alterado.'
                          )
                        }
                      >
                        {m.papel === 'visitante' ? 'Tornar membro' : 'Tornar visitante'}
                      </Botao>
                      <Botao variante="perigo" onClick={() => setRemovendo(m.user_id)}>
                        Remover
                      </Botao>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
