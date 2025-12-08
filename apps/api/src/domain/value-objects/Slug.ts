import { ValidationError } from '../errors/DomainError';

/**
 * Value object representing a URL-friendly slug.
 * Encapsulates slug validation and normalization.
 */
export class Slug {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a Slug from a raw string.
   * @param value - The slug string.
   * @throws ValidationError if the slug format is invalid.
   */
  static create(value: string): Slug {
    if (!value || value.trim() === '') {
      throw new ValidationError('Slug cannot be empty');
    }

    const normalized = Slug.normalize(value);
    
    if (!Slug.isValidFormat(normalized)) {
      throw new ValidationError(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      );
    }

    return new Slug(normalized);
  }

  /**
   * Reconstructs a Slug from persistence.
   */
  static fromPersistence(value: string): Slug {
    return new Slug(value);
  }

  /**
   * Generates a slug from a title.
   */
  static fromTitle(title: string): Slug {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return Slug.create(slug);
  }

  private static normalize(value: string): string {
    return value.toLowerCase().trim();
  }

  private static isValidFormat(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Slug): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
