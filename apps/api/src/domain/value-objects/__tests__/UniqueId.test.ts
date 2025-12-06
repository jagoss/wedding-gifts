import { UniqueId } from '../UniqueId';

describe('UniqueId', () => {
  describe('Happy Path', () => {
    it('should create a new unique ID', () => {
      // Act
      const id = UniqueId.create();

      // Assert
      expect(id.value).toBeDefined();
      expect(typeof id.value).toBe('string');
      expect(id.value.length).toBeGreaterThan(0);
    });

    it('should create unique IDs', () => {
      // Act
      const id1 = UniqueId.create();
      const id2 = UniqueId.create();

      // Assert
      expect(id1.value).not.toBe(id2.value);
    });

    it('should create from existing string', () => {
      // Arrange
      const existingId = 'test-id-123';

      // Act
      const id = UniqueId.fromString(existingId);

      // Assert
      expect(id.value).toBe(existingId);
    });

    it('should create valid UUID format', () => {
      // Act
      const id = UniqueId.create();

      // Assert
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(id.value)).toBe(true);
    });
  });

  describe('Validation Errors', () => {
    it('should throw error for empty string', () => {
      // Act & Assert
      expect(() => UniqueId.fromString('')).toThrow('UniqueId cannot be empty');
    });

    it('should throw error for whitespace only', () => {
      // Act & Assert
      expect(() => UniqueId.fromString('   ')).toThrow('UniqueId cannot be empty');
    });
  });

  describe('Equality', () => {
    it('should return true for equal IDs', () => {
      // Arrange
      const id1 = UniqueId.fromString('same-id');
      const id2 = UniqueId.fromString('same-id');

      // Act & Assert
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      // Arrange
      const id1 = UniqueId.fromString('id-1');
      const id2 = UniqueId.fromString('id-2');

      // Act & Assert
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return ID value as string', () => {
      // Arrange
      const id = UniqueId.fromString('test-id');

      // Act & Assert
      expect(id.toString()).toBe('test-id');
    });
  });
});

