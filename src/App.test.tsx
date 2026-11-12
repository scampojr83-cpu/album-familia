import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.stubGlobal('__VERSAO__', '0.2.0');
const { default: App } = await import('./App');

it('sem configuração do Supabase, mostra a tela de boas-vindas em português', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Bem-vindos à família' })).toBeInTheDocument();
  expect(screen.getByText(/aguardando configuração/)).toBeInTheDocument();
});
