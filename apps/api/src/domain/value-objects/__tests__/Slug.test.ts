import { Slug } from '../Slug';
import { ValidationError } from '../../errors/DomainError';

describe('Slug', () => {
  describe('Happy Path', () => {
    it('should create slug from valid string', () => {
      // Act
      const slug = Slug.create('my-wedding');

      // Assert
      expect(slug.value).toBe('my-wedding');
    });

    it('should convert title to slug', () => {
      // Act
      const slug = Slug.fromTitle('My Beautiful Wedding');

      // Assert
      expect(slug.value).toBe('my-beautiful-wedding');
    });

    it('should handle spaces in title', () => {
      // Act
      const slug = Slug.fromTitle('Wedding  With  Multiple  Spaces');

      // Assert
      expect(slug.value).toBe('wedding-with-multiple-spaces');
    });

    it('should remove special characters', () => {
      // Act
      const slug = Slug.fromTitle('Wedding & Reception!!!');

      // Assert
      expect(slug.value).toBe('wedding-reception');
    });

    it('should handle accented characters by removing them', () => {
      // Act
      const slug = Slug.fromTitle('Boda María José');

      // Assert
      expect(slug.value).toBe('boda-mara-jos');
    });

    it('should trim hyphens from edges', () => {
      // Act
      const slug = Slug.fromTitle('---Wedding---');

      // Assert
      expect(slug.value).toBe('wedding');
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for empty string', () => {
      // Act & Assert
      expect(() => Slug.create('')).toThrow(ValidationError);
      expect(() => Slug.create('')).toThrow('Slug cannot be empty');
    });

    it('should throw ValidationError for invalid characters', () => {
      // Act & Assert
      expect(() => Slug.create('my wedding')).toThrow(ValidationError);
      expect(() => Slug.create('my_wedding')).toThrow(ValidationError);
      expect(() => Slug.create('my@wedding')).toThrow(ValidationError);
    });

    it('should normalize uppercase to lowercase', () => {
      // Act
      const slug = Slug.create('My-Wedding');

      // Assert - Slug.create normalizes the input, doesn't throw
      expect(slug.value).toBe('my-wedding');
    });

    it('should throw ValidationError for empty title', () => {
      // Act & Assert
      expect(() => Slug.fromTitle('')).toThrow(ValidationError);
    });

    it('should throw ValidationError for title with only special characters', () => {
      // Act & Assert
      expect(() => Slug.fromTitle('!!!')).toThrow(ValidationError);
    });
  });

  describe('Equality', () => {
    it('should return true for equal slugs', () => {
      // Arrange
      const slug1 = Slug.create('my-wedding');
      const slug2 = Slug.create('my-wedding');

      // Act & Assert
      expect(slug1.equals(slug2)).toBe(true);
    });

    it('should return false for different slugs', () => {
      // Arrange
      const slug1 = Slug.create('wedding-1');
      const slug2 = Slug.create('wedding-2');

      // Act & Assert
      expect(slug1.equals(slug2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      // Arrange
      const longTitle = 'A'.repeat(200);

      // Act
      const slug = Slug.fromTitle(longTitle);

      // Assert
      expect(slug.value.length).toBeLessThanOrEqual(200);
    });

    it('should handle numbers in title', () => {
      // Act
      const slug = Slug.fromTitle('Wedding 2025');

      // Assert
      expect(slug.value).toBe('wedding-2025');
    });

    it('should collapse multiple hyphens', () => {
      // Act
      const slug = Slug.fromTitle('Wedding --- 2025');

      // Assert
      expect(slug.value).toBe('wedding-2025');
    });
  });

  describe('toString', () => {
    it('should return slug value as string', () => {
      // Arrange
      const slug = Slug.create('my-wedding');

      // Act & Assert
      expect(slug.toString()).toBe('my-wedding');
    });
  });
});

