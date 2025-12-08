import { ValidationError } from '../errors/DomainError';

/**
 * Value object representing a monetary amount with currency.
 * Provides type-safety for financial calculations.
 */
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string
  ) {}

  /**
   * Creates a Money value object.
   * @param amount - The monetary amount (must be non-negative).
   * @param currency - The ISO currency code (e.g., 'USD', 'UYU').
   * @throws ValidationError if amount is negative or currency is invalid.
   */
  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }
    if (!currency || currency.trim().length !== 3) {
      throw new ValidationError('Invalid currency code');
    }
    return new Money(amount, currency.toUpperCase().trim());
  }

  /**
   * Creates a zero-value Money object.
   */
  static zero(currency: string): Money {
    return Money.create(0, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  /**
   * Adds another Money amount (must be same currency).
   */
  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new ValidationError('Cannot add money of different currencies');
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }
}
