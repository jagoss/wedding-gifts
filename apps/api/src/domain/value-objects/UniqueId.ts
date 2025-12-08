import { randomUUID } from 'crypto';

/**
 * Value object representing a unique identifier.
 * Encapsulates ID generation and validation logic within the domain.
 */
export class UniqueId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new unique identifier.
   */
  static create(): UniqueId {
    return new UniqueId(randomUUID());
  }

  /**
   * Reconstructs a UniqueId from an existing string value.
   * @param value - The existing ID string.
   * @throws Error if value is empty.
   */
  static fromString(value: string): UniqueId {
    if (!value || value.trim() === '') {
      throw new Error('UniqueId cannot be empty');
    }
    return new UniqueId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UniqueId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
