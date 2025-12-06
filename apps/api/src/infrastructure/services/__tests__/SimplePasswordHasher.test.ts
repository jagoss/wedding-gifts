import { SimplePasswordHasher } from '../SimplePasswordHasher';

describe('SimplePasswordHasher', () => {
  let hasher: SimplePasswordHasher;

  beforeEach(() => {
    hasher = new SimplePasswordHasher();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      // Act
      const hashed = await hasher.hash('mypassword');

      // Assert
      expect(hashed).toBe('hashed_mypassword');
    });

    it('should create consistent hashes', async () => {
      // Act
      const hash1 = await hasher.hash('password');
      const hash2 = await hasher.hash('password');

      // Assert
      expect(hash1).toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const password = 'mypassword';
      const hash = await hasher.hash(password);

      // Act
      const result = await hasher.compare(password, hash);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const hash = await hasher.hash('correctpassword');

      // Act
      const result = await hasher.compare('wrongpassword', hash);

      // Assert
      expect(result).toBe(false);
    });
  });
});

