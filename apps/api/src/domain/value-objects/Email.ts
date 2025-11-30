import { ValidationError } from '../errors/DomainError';

/**
 * Value object representing an email address.
 * Encapsulates email validation logic within the domain.
 */
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.toLowerCase().trim();
  }

  /**
   * Creates an Email value object with validation.
   * @param value - The email string.
   * @throws ValidationError if the email format is invalid.
   */
  static create(value: string): Email {
    if (!value || !Email.isValidFormat(value)) {
      throw new ValidationError('Invalid email format');
    }
    return new Email(value);
  }

  /**
   * Reconstructs an Email from a trusted source (e.g., database).
   * Skips validation for performance.
   */
  static fromPersistence(value: string): Email {
    return new Email(value);
  }

  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
