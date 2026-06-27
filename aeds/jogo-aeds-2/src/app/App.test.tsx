import { render, screen } from '@testing-library/react';

import App from './App';

// Smoke test do shell contra o novo engine de quiz. A interação completa do
// encontro (responder etapas pela UI nova) é coberta na Fase 2 pelo frontend,
// quando App.tsx e seus componentes forem recompostos sobre o contrato do engine.
test('renders the run shell with the first encounter and HUD', () => {
  render(<App />);

  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Run de Algoritmos' })).toBeInTheDocument();
  expect(screen.getByText('Pesquisar elemento em ABB')).toBeInTheDocument();
  expect(screen.getByText('Foco 3/3')).toBeInTheDocument();
  expect(screen.getByText('Energia 4/4')).toBeInTheDocument();
});
