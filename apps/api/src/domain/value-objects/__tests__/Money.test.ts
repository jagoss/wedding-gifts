import { Money } from '../Money';
import { ValidationError } from '../../errors/DomainError';

describe('Money', () => {
  describe('Happy Path', () => {
    it('should create money with amount and currency', () => {
      // Act
      const money = Money.create(10000, 'ARS');

      // Assert
      expect(money.amount).toBe(10000);
      expect(money.currency).toBe('ARS');
    });

    it('should create money with zero amount', () => {
      // Act
      const money = Money.create(0, 'USD');

      // Assert
      expect(money.amount).toBe(0);
      expect(money.currency).toBe('USD');
    });

    it('should create money with decimal amounts', () => {
      // Act
      const money = Money.create(99.99, 'USD');

      // Assert
      expect(money.amount).toBe(99.99);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for negative amount', () => {
      // Act & Assert
      expect(() => Money.create(-100, 'USD')).toThrow(ValidationError);
      expect(() => Money.create(-100, 'USD')).toThrow('Amount cannot be negative');
    });

    it('should throw ValidationError for empty currency', () => {
      // Act & Assert
      expect(() => Money.create(100, '')).toThrow(ValidationError);
      expect(() => Money.create(100, '')).toThrow('Invalid currency code');
    });

    it('should throw ValidationError for invalid currency format', () => {
      // Act & Assert
      expect(() => Money.create(100, 'us')).toThrow(ValidationError);
      expect(() => Money.create(100, 'USDA')).toThrow(ValidationError);
    });
  });

  describe('Equality', () => {
    it('should return true for equal money', () => {
      // Arrange
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(100, 'USD');

      // Act & Assert
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      // Arrange
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(200, 'USD');

      // Act & Assert
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      // Arrange
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(100, 'ARS');

      // Act & Assert
      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large amounts', () => {
      // Act
      const money = Money.create(999999999.99, 'USD');

      // Assert
      expect(money.amount).toBe(999999999.99);
    });

    it('should handle different currency codes', () => {
      // Arrange
      const currencies = ['USD', 'EUR', 'GBP', 'ARS', 'BRL', 'JPY'];

      // Act & Assert
      currencies.forEach(currency => {
        const money = Money.create(100, currency);
        expect(money.currency).toBe(currency);
      });
    });
  });
});

