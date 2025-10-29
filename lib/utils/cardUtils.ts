export const isValidLuhn = (cardNumber?: string | null): boolean => {
  if (!cardNumber) {
    return false;
  }

  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number.parseInt(digits.charAt(i), 10);

    if (Number.isNaN(digit)) {
      return false;
    }

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const detectCardBrand = (cardNumber?: string | null): string => {
  if (!cardNumber) {
    return 'Tarjeta';
  }

  const digits = cardNumber.replace(/\D/g, '');

  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  if (/^3(?:0[0-5]|[68])/.test(digits)) return 'Diners Club';
  if (/^(?:2131|1800|35)/.test(digits)) return 'JCB';

  return 'Desconocida';
};
