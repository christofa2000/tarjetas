import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import Page from '../page';

describe('LoginPage', () => {
  it('muestra validaciones cuando el form est\u00E1 vac\u00EDo', async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText(/Email inv\u00E1lido/i)).toBeInTheDocument();
    expect(await screen.findByText(/M\u00EDnimo 4 caracteres/i)).toBeInTheDocument();
  });
});
