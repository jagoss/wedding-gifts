import { ValidateTokenUseCase } from '../ValidateTokenUseCase';
import { MockUserRepository, MockTokenService } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { AuthenticationError } from '../../../../domain/errors/DomainError';

describe('ValidateTokenUseCase', () => {
  let useCase: ValidateTokenUseCase;
  let userRepository: MockUserRepository;
  let tokenService: MockTokenService;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    tokenService = new MockTokenService();
    useCase = new ValidateTokenUseCase(userRepository, tokenService);
  });

  describe('Happy Path', () => {
    it('should validate a valid token and return user', async () => {
      // Arrange
      const user = TestDataFactory.createUser({
        id: 'user_123',
        email: 'valid@example.com',
      });
      await userRepository.save(user);

      const token = tokenService.generateToken({ userId: user.id.value });

      // Act
      const result = await useCase.execute(token);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(user.id.value);
      expect(result.email).toBe('valid@example.com');
    });

    it('should work with newly generated tokens', async () => {
      // Arrange
      const user = TestDataFactory.createUser();
      await userRepository.save(user);

      const token = tokenService.generateToken({ userId: user.id.value });

      // Act
      const result = await useCase.execute(token);

      // Assert
      expect(result.id).toBe(user.id.value);
    });
  });

  describe('Authentication Errors', () => {
    it('should throw AuthenticationError for invalid token format', async () => {
      // Arrange
      const invalidToken = 'invalid-token-format';

      // Act & Assert
      await expect(useCase.execute(invalidToken)).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when user does not exist', async () => {
      // Arrange
      const token = tokenService.generateToken({ userId: 'nonexistent_user_id' });

      // Act & Assert
      await expect(useCase.execute(token)).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for empty token', async () => {
      // Arrange
      const emptyToken = '';

      // Act & Assert
      await expect(useCase.execute(emptyToken)).rejects.toThrow(AuthenticationError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tokens with special characters', async () => {
      // Arrange
      const user = TestDataFactory.createUser();
      await userRepository.save(user);

      const token = `token_${user.id.value}_1234567890`;

      // Act
      const result = await useCase.execute(token);

      // Assert
      expect(result.id).toBe(user.id.value);
    });

    it('should not cache user data between validations', async () => {
      // Arrange
      const user = TestDataFactory.createUser();
      await userRepository.save(user);

      const token = tokenService.generateToken({ userId: user.id.value });

      // Act - First validation
      const result1 = await useCase.execute(token);

      // Delete user from repository
      await userRepository.delete(user.id);

      // Assert - Second validation should fail
      await expect(useCase.execute(token)).rejects.toThrow(AuthenticationError);
    });
  });
});

