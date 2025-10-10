import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import Page from '../page';

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

describe('LoginPage', () => {
  it('muestra validaciones cuando el formulario está vacío', async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(
      await screen.findByText((content) => normalize(content).includes('email invalido')),
    ).toBeInTheDocument();

    expect(
      await screen.findByText((content) => normalize(content).includes('minimo 4 caracteres')),
    ).toBeInTheDocument();
  });
});
