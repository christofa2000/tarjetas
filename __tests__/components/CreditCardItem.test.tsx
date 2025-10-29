import CreditCardItem from '@/components/cards/CreditCardItem';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock del ValidationModal
jest.mock('@/components/cards/ValidationModal', () => ({
  __esModule: true,
  default: ({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="validation-modal">
        <button onClick={onSuccess}>Validate</button>
      </div>
    );
  },
}));

describe('CreditCardItem', () => {
  const defaultProps = {
    cardName: 'Visa Black Card',
    cardNumber: '4111111111111111',
    cardholder: 'John Doe',
    expiration: '12/26',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render card with provided props', () => {
    render(<CreditCardItem {...defaultProps} />);

    expect(screen.getByText('Visa Black Card')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
  });

  it('should render with default props', () => {
    render(<CreditCardItem />);

    expect(screen.getByText('Visa Black Card')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    // Por defecto los datos están ocultos, así que debería mostrar "**** ****"
    expect(screen.getByText('**** ****')).toBeInTheDocument();
  });

  it('should mask card number by default', () => {
    render(<CreditCardItem cardNumber="4111111111111111" />);

    const maskedNumber = screen.getByText(/^\*\*\*\* \*\*\*\* \*\*\*\* 1111$/);
    expect(maskedNumber).toBeInTheDocument();
  });

  it('should show full card number after validation', async () => {
    const user = userEvent.setup();
    render(<CreditCardItem cardNumber="4111111111111111" />);

    const showDataButton = screen.getByText('Mostrar datos');
    await user.click(showDataButton);

    const validateButton = screen.getByTestId('validation-modal');
    expect(validateButton).toBeInTheDocument();

    await user.click(screen.getByText('Validate'));

    await waitFor(
      () => {
        expect(screen.getByText('4111 1111 1111 1111')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should display cardholder name when revealed', async () => {
    const user = userEvent.setup();
    render(<CreditCardItem cardholder="Jane Doe" />);

    const showDataButton = screen.getByText('Mostrar datos');
    await user.click(showDataButton);

    await user.click(screen.getByText('Validate'));

    await waitFor(
      () => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should display expiration date when revealed', async () => {
    const user = userEvent.setup();
    render(<CreditCardItem expiration="03/25" />);

    const showDataButton = screen.getByText('Mostrar datos');
    await user.click(showDataButton);

    await user.click(screen.getByText('Validate'));

    await waitFor(
      () => {
        expect(screen.getByText('03/25')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should detect card brand correctly', () => {
    render(<CreditCardItem cardNumber="5555555555554444" />);
    expect(screen.getByText('Mastercard')).toBeInTheDocument();
  });

  it('should show error message for invalid card number', () => {
    render(<CreditCardItem cardNumber="1234567890123456" />);
    expect(screen.getByText('Numero invalido')).toBeInTheDocument();
  });

  it('should show "Datos ocultos" badge by default', () => {
    render(<CreditCardItem />);
    expect(screen.getByText('Datos ocultos')).toBeInTheDocument();
  });

  it('should show "Datos visibles" badge after validation', async () => {
    const user = userEvent.setup();
    render(<CreditCardItem />);

    const showDataButton = screen.getByText('Mostrar datos');
    await user.click(showDataButton);

    await user.click(screen.getByText('Validate'));

    await waitFor(
      () => {
        expect(screen.getByText('Datos visibles')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should mask cardholder and expiration by default', () => {
    render(<CreditCardItem cardholder="John Doe" expiration="12/26" />);

    expect(screen.getByText('**** ****')).toBeInTheDocument();
    expect(screen.getByText('**/**')).toBeInTheDocument();
  });
});
