import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.stubGlobal('__VERSAO__', '0.1.0');
const { default: App } = await import('./App');

it('mostra a tela de boas-vindas em português', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Bem-vindos à família' })).toBeInTheDocument();
  expect(screen.getByText('Álbum Familiar')).toBeInTheDocument();
});
