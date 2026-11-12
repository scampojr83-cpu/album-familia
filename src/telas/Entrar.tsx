import { useEffect, useRef, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { formatarCodigo } from '../lib/convite';
import { mensagemDeErro } from '../lib/textos';
import CartaoInstalar from '../componentes/CartaoInstalar';
import { Aviso, Botao, Campo, Cartao } from '../componentes/ui';

const ESPERA_REENVIO = 60;

export default function Entrar({ codigoConvite }: { codigoConvite: string | null }) {
  const [email, setEmail] = useState('');
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [espera, setEspera] = useState(0);
  const campoCodigo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function entrarComGoogle() {
    if (!supabase) return;
    setErro(null);
    setOcupado(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setErro(mensagemDeErro(error));
      setOcupado(false);
    }
  }

  async function enviarCodigo(e?: FormEvent) {
    e?.preventDefault();
    if (!supabase) return;
    const destino = (enviadoPara ?? email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(destino)) {
      setErro('Este e-mail não parece certo. Confira e tente de novo.');
      return;
    }
    setErro(null);
    setOcupado(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: destino,
      options: { shouldCreateUser: true },
    });
    setOcupado(false);
    if (error) {
      setErro(mensagemDeErro(error));
      return;
    }
    setEnviadoPara(destino);
    setEspera(ESPERA_REENVIO);
    setTimeout(() => campoCodigo.current?.focus(), 50);
  }

  async function conferirCodigo(valor: string) {
    if (!supabase || !enviadoPara) return;
    setErro(null);
    setOcupado(true);
    const { error } = await supabase.auth.verifyOtp({ email: enviadoPara, token: valor, type: 'email' });
    if (error) {
      setErro(mensagemDeErro(error));
      setOcupado(false);
      setCodigo('');
    }
    // Se deu certo, o app troca de tela sozinho.
  }

  function aoDigitarCodigo(texto: string) {
    const so = texto.replace(/\D/g, '').slice(0, 6);
    setCodigo(so);
    if (so.length === 6) void conferirCodigo(so);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-5 py-10 text-center">
      <img src="/pwa-192.png" alt="" width={96} height={96} className="rounded-[22px] shadow-lg" />
      <div>
        <h1 className="text-3xl font-bold leading-tight">
          {codigoConvite ? 'Você foi convidado(a)!' : 'Bem-vindos à família'}
        </h1>
        <p className="mt-3 text-lg text-apagado">
          Este é o <strong className="text-tinta">Álbum Familiar</strong>, o álbum de fotos da nossa
          família.
        </p>
        {codigoConvite && (
          <p className="mt-3 text-lg">
            Seu código de convite: <strong className="tracking-wider">{formatarCodigo(codigoConvite)}</strong>
          </p>
        )}
      </div>

      <CartaoInstalar />

      <Cartao>
        <h2 className="text-xl font-semibold">Entrar</h2>
        {erro && (
          <div className="mt-3">
            <Aviso>{erro}</Aviso>
          </div>
        )}

        {!enviadoPara ? (
          <>
            <Botao variante="secundario" className="mt-4" onClick={entrarComGoogle} disabled={ocupado}>
              <span aria-hidden="true" className="mr-2 font-bold text-[#4285F4]">G</span>
              Entrar com Google
            </Botao>
            <p className="my-4 text-center text-apagado">ou receba um código no seu e-mail</p>
            <form onSubmit={enviarCodigo} className="space-y-4">
              <Campo
                rotulo="Seu e-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@gmail.com"
              />
              <Botao type="submit" carregando={ocupado}>
                Receber código por e-mail
              </Botao>
            </form>
          </>
        ) : (
          <div className="mt-4 space-y-4">
            <Aviso tipo="info">
              Enviamos um código de 6 números para <strong>{enviadoPara}</strong>. Pode levar 1
              minuto. Se não chegar, olhe também a pasta de spam.
            </Aviso>
            <Campo
              ref={campoCodigo}
              rotulo="Código do e-mail"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={codigo}
              onChange={(e) => aoDigitarCodigo(e.target.value)}
              placeholder="000000"
              className="text-center text-3xl tracking-[0.4em]"
              disabled={ocupado}
            />
            <Botao onClick={() => conferirCodigo(codigo)} disabled={codigo.length !== 6} carregando={ocupado}>
              Entrar
            </Botao>
            <Botao variante="secundario" onClick={() => enviarCodigo()} disabled={espera > 0 || ocupado}>
              {espera > 0 ? `Enviar de novo (em ${espera}s)` : 'Enviar o código de novo'}
            </Botao>
            <Botao
              variante="leve"
              onClick={() => {
                setEnviadoPara(null);
                setCodigo('');
                setErro(null);
              }}
            >
              Usar outro e-mail
            </Botao>
          </div>
        )}
      </Cartao>
    </main>
  );
}
