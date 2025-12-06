import { MockTokenService } from '../MockTokenService';

describe('MockTokenService', () => {
  let service: MockTokenService;

  beforeEach(() => {
    service = new MockTokenService();
  });

  describe('generateToken', () => {
    it('should generate a token for user ID', () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const token = service.generateToken({ userId });

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toContain(userId);
    });

    it('should generate consistent tokens for same user ID', () => {
      // Arrange
      const userId = 'user-456';

      // Act
      const token1 = service.generateToken({ userId });
      const token2 = service.generateToken({ userId });

      // Assert
      expect(token1).toBe(token2);
    });

    it('should generate different tokens for different user IDs', () => {
      // Arrange
      const userId1 = 'user-111';
      const userId2 = 'user-222';

      // Act
      const token1 = service.generateToken({ userId: userId1 });
      const token2 = service.generateToken({ userId: userId2 });

      // Assert
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token and return payload', () => {
      // Arrange
      const userId = 'user-789';
      const token = service.generateToken({ userId });

      // Act
      const payload = service.verifyToken(token);

      // Assert
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(userId);
    });

    it('should return null for invalid token format', () => {
      // Arrange
      const invalidToken = 'invalid-token-format';

      // Act
      const payload = service.verifyToken(invalidToken);

      // Assert
      expect(payload).toBeNull();
    });

    it('should return null for empty token', () => {
      // Act
      const payload = service.verifyToken('');

      // Assert
      expect(payload).toBeNull();
    });

    it('should return null for token without user ID', () => {
      // Arrange
      const malformedToken = 'mock-token-for-';

      // Act
      const payload = service.verifyToken(malformedToken);

      // Assert
      expect(payload).toBeNull();
    });

    it('should handle tokens with special characters in user ID', () => {
      // Arrange
      const userId = 'user-abc-123-xyz';
      const token = service.generateToken({ userId });

      // Act
      const payload = service.verifyToken(token);

      // Assert
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(userId);
    });
  });
});

