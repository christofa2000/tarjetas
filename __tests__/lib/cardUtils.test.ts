import { detectCardBrand, isValidLuhn } from '@/lib/utils/cardUtils';
import { describe, expect, it } from '@jest/globals';

describe('cardUtils', () => {
  describe('isValidLuhn', () => {
    it('should return true for valid Visa card', () => {
      expect(isValidLuhn('4111111111111111')).toBe(true);
    });

    it('should return true for valid Mastercard', () => {
      expect(isValidLuhn('5555555555554444')).toBe(true);
    });

    it('should return false for invalid card number', () => {
      expect(isValidLuhn('1234567890123456')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidLuhn(null)).toBe(false);
      expect(isValidLuhn(undefined)).toBe(false);
      expect(isValidLuhn('')).toBe(false);
    });

    it('should handle card numbers with spaces and dashes', () => {
      expect(isValidLuhn('4111 1111 1111 1111')).toBe(true);
      expect(isValidLuhn('4111-1111-1111-1111')).toBe(true);
    });

    it('should reject card numbers that are too short', () => {
      expect(isValidLuhn('123456789012')).toBe(false);
    });

    it('should reject card numbers that are too long', () => {
      expect(isValidLuhn('12345678901234567890')).toBe(false);
    });

    it('should validate American Express card', () => {
      expect(isValidLuhn('378282246310005')).toBe(true);
    });

    it('should validate Discover card', () => {
      expect(isValidLuhn('6011111111111117')).toBe(true);
    });
  });

  describe('detectCardBrand', () => {
    it('should detect Visa', () => {
      expect(detectCardBrand('4111111111111111')).toBe('Visa');
      expect(detectCardBrand('4000000000000002')).toBe('Visa');
    });

    it('should detect Mastercard', () => {
      expect(detectCardBrand('5555555555554444')).toBe('Mastercard');
      expect(detectCardBrand('5105105105105100')).toBe('Mastercard');
    });

    it('should detect American Express', () => {
      expect(detectCardBrand('378282246310005')).toBe('American Express');
      expect(detectCardBrand('371449635398431')).toBe('American Express');
    });

    it('should detect Discover', () => {
      expect(detectCardBrand('6011111111111117')).toBe('Discover');
      expect(detectCardBrand('6011000990139424')).toBe('Discover');
    });

    it('should detect Diners Club', () => {
      expect(detectCardBrand('30569309025904')).toBe('Diners Club');
    });

    it('should return "Tarjeta" for null or undefined', () => {
      expect(detectCardBrand(null)).toBe('Tarjeta');
      expect(detectCardBrand(undefined)).toBe('Tarjeta');
      expect(detectCardBrand('')).toBe('Tarjeta');
    });

    it('should return "Desconocida" for unrecognized brands', () => {
      expect(detectCardBrand('1234567890123456')).toBe('Desconocida');
    });

    it('should handle card numbers with spaces and dashes', () => {
      expect(detectCardBrand('4111 1111 1111 1111')).toBe('Visa');
      expect(detectCardBrand('5555-5555-5555-4444')).toBe('Mastercard');
    });
  });
});
