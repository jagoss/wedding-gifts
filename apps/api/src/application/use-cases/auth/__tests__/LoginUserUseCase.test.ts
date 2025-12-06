import { LoginUserUseCase } from '../LoginUserUseCase';
import { MockUserRepository, MockPasswordHasher, MockTokenService } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { AuthenticationError, ValidationError } from '../../../../domain/errors/DomainError';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: MockUserRepository;
  let passwordHasher: MockPasswordHasher;
  let tokenService: MockTokenService;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    passwordHasher = new MockPasswordHasher();
    tokenService = new MockTokenService();
    useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
  });

  describe('Happy Path', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const user = TestDataFactory.createUser({
        email: 'john@example.com',
        passwordHash: 'hashed_CorrectPassword',
      });
      await userRepository.save(user);

      const input = {
        email: 'john@example.com',
        password: 'CorrectPassword',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).toContain('token_');
    });

    it('should generate a valid token containing user ID', async () => {
      // Arrange
      const user = TestDataFactory.createUser({
        email: 'jane@example.com',
        passwordHash: 'hashed_Password123',
      });
      await userRepository.save(user);

      const input = {
        email: 'jane@example.com',
        password: 'Password123',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      const payload = tokenService.verifyToken(result.accessToken);
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(user.id.value);
    });
  });

  describe('Authentication Errors', () => {
    it('should throw AuthenticationError when user does not exist', async () => {
      // Arrange
      const input = {
        email: 'nonexistent@example.com',
        password: 'AnyPassword',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(AuthenticationError);
      await expect(useCase.execute(input)).rejects.toThrow('Invalid credentials');
    });

    it('should throw AuthenticationError when password is incorrect', async () => {
      // Arrange
      const user = TestDataFactory.createUser({
        email: 'user@example.com',
        passwordHash: 'hashed_CorrectPassword',
      });
      await userRepository.save(user);

      const input = {
        email: 'user@example.com',
        password: 'WrongPassword',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(AuthenticationError);
      await expect(useCase.execute(input)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when email is empty', async () => {
      // Arrange
      const input = {
        email: '',
        password: 'Password123',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when password is empty', async () => {
      // Arrange
      const input = {
        email: 'user@example.com',
        password: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email format is invalid', async () => {
      // Arrange
      const input = {
        email: 'invalid-email',
        password: 'Password123',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle email case insensitivity during login', async () => {
      // Arrange
      const user = TestDataFactory.createUser({
        email: 'case@example.com',
        passwordHash: 'hashed_Password123',
      });
      await userRepository.save(user);

      const input = {
        email: 'CASE@EXAMPLE.COM',
        password: 'Password123',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.user.email).toBe('case@example.com');
    });

    it('should not reveal whether email exists in error message', async () => {
      // Arrange - No user registered
      const input = {
        email: 'unknown@example.com',
        password: 'AnyPassword',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Invalid credentials');

      // Should not say "User not found" or similar
      try {
        await useCase.execute(input);
      } catch (error: any) {
        expect(error.message).not.toContain('not found');
        expect(error.message).not.toContain('does not exist');
      }
    });
  });
});

