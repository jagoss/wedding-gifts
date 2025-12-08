import { Email } from '../Email';
import { ValidationError } from '../../errors/DomainError';

describe('Email', () => {
  describe('Happy Path', () => {
    it('should create a valid email', () => {
      // Arrange & Act
      const email = Email.create('test@example.com');

      // Assert
      expect(email.value).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      // Arrange & Act
      const email = Email.create('TEST@EXAMPLE.COM');

      // Assert
      expect(email.value).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      // Arrange & Act
      const email = Email.create('TEST@EXAMPLE.COM');

      // Assert
      expect(email.value).toBe('test@example.com');
    });

    it('should create from persistence without validation', () => {
      // Arrange & Act
      const email = Email.fromPersistence('existing@example.com');

      // Assert
      expect(email.value).toBe('existing@example.com');
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for empty string', () => {
      // Act & Assert
      expect(() => Email.create('')).toThrow(ValidationError);
      expect(() => Email.create('')).toThrow('Invalid email format');
    });

    it('should throw ValidationError for email without @', () => {
      // Act & Assert
      expect(() => Email.create('testexample.com')).toThrow(ValidationError);
    });

    it('should throw ValidationError for email without domain', () => {
      // Act & Assert
      expect(() => Email.create('test@')).toThrow(ValidationError);
    });

    it('should throw ValidationError for email without username', () => {
      // Act & Assert
      expect(() => Email.create('@example.com')).toThrow(ValidationError);
    });

    it('should throw ValidationError for email with spaces', () => {
      // Act & Assert
      expect(() => Email.create('test @example.com')).toThrow(ValidationError);
    });
  });

  describe('Equality', () => {
    it('should return true for equal emails', () => {
      // Arrange
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      // Arrange
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email value as string', () => {
      // Arrange
      const email = Email.create('test@example.com');

      // Act & Assert
      expect(email.toString()).toBe('test@example.com');
    });
  });
});

