import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
const verifyOtp = vi.fn().mockResolvedValue({ error: { message: 'Token has expired or is invalid' } });
vi.mock('../lib/supabase', () => ({
  supabase: { auth: { signInWithOtp, verifyOtp, signInWithOAuth: vi.fn() } },
}));
const { default: Entrar } = await import('./Entrar');

it('mostra o convite e os dois jeitos de entrar', () => {
  render(<Entrar codigoConvite="ABCDEFGH" />);
  expect(screen.getByRole('heading', { name: 'Você foi convidado(a)!' })).toBeInTheDocument();
  expect(screen.getByText('ABCD-EFGH')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Entrar com Google/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Receber código por e-mail' })).toBeInTheDocument();
});

it('envia o código por e-mail, sem link mágico, e avisa se o código estiver errado', async () => {
  render(<Entrar codigoConvite={null} />);
  fireEvent.change(screen.getByLabelText('Seu e-mail'), { target: { value: ' Vo@Exemplo.com ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Receber código por e-mail' }));
  await screen.findByText(/Enviamos um código de 6 números/);
  expect(signInWithOtp).toHaveBeenCalledWith({ email: 'vo@exemplo.com', options: { shouldCreateUser: true } });

  fireEvent.change(screen.getByLabelText('Código do e-mail'), { target: { value: '123456' } });
  await waitFor(() =>
    expect(verifyOtp).toHaveBeenCalledWith({ email: 'vo@exemplo.com', token: '123456', type: 'email' })
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('Código errado');
});
