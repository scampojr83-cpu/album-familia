// Peças de tela reutilizadas: botões grandes (mín. 48px), campos e avisos.
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

type Variante = 'principal' | 'secundario' | 'perigo' | 'leve';

const ESTILOS: Record<Variante, string> = {
  principal: 'bg-terracota text-white active:bg-terracota-escuro',
  secundario: 'border-2 border-tinta/20 bg-white text-tinta active:bg-creme',
  perigo: 'border-2 border-perigo bg-white text-perigo active:bg-perigo/10',
  leve: 'text-terracota-escuro underline underline-offset-4',
};

export function Botao({
  variante = 'principal',
  className = '',
  carregando,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; carregando?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || carregando}
      className={`min-h-14 w-full rounded-xl px-5 text-lg font-semibold disabled:opacity-60 ${ESTILOS[variante]} ${className}`}
    >
      {carregando ? 'Aguarde…' : children}
    </button>
  );
}

export function Campo({
  rotulo,
  dica,
  ...props
}: ComponentProps<'input'> & { rotulo: string; dica?: string }) {
  return (
    <label className="block text-left">
      <span className="text-lg font-semibold">{rotulo}</span>
      {dica && <span className="mt-1 block text-apagado">{dica}</span>}
      <input
        {...props}
        className={`mt-2 min-h-14 w-full rounded-xl border-2 border-tinta/25 bg-white px-4 text-xl focus:border-terracota focus:outline-none ${props.className ?? ''}`}
      />
    </label>
  );
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`w-full rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function Aviso({ tipo = 'erro', children }: { tipo?: 'erro' | 'ok' | 'info'; children: ReactNode }) {
  const cor =
    tipo === 'erro'
      ? 'border-perigo bg-perigo/10 text-perigo'
      : tipo === 'ok'
        ? 'border-verde bg-verde/10 text-verde'
        : 'border-tinta/20 bg-creme text-tinta';
  return (
    <p role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-xl border-2 px-4 py-3 text-left ${cor}`}>
      {children}
    </p>
  );
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center" role="status">
      <img src="/pwa-192.png" alt="" width={80} height={80} className="animate-pulse rounded-[20px]" />
      <p className="text-lg text-apagado">{texto}</p>
    </div>
  );
}
