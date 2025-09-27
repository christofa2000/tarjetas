import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import Page from '../page';

describe('LoginPage', () => {
  it('muestra validaciones cuando el formulario está vacío', async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
    expect(await screen.findByText(/mínimo 4 caracteres/i)).toBeInTheDocument();
  });
});
