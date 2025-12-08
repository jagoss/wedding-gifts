import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { MockUserRepository, MockPasswordHasher } from '../../../../test-utils/MockRepositories';
import { Email } from '../../../../domain/value-objects';
import { ConflictError, ValidationError } from '../../../../domain/errors/DomainError';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: MockUserRepository;
  let passwordHasher: MockPasswordHasher;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    passwordHasher = new MockPasswordHasher();
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  describe('Happy Path', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should hash the password before storing', async () => {
      // Arrange
      const input = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'MyPassword456',
      };

      // Act
      await useCase.execute(input);

      // Assert
      const savedUser = await userRepository.findByEmail(Email.create(input.email));
      expect(savedUser).toBeDefined();
      expect(savedUser!.passwordHash).toBe('hashed_MyPassword456');
      expect(savedUser!.passwordHash).not.toBe(input.password);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when name is empty', async () => {
      // Arrange
      const input = {
        name: '',
        email: 'valid@example.com',
        password: 'Password123',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email is invalid', async () => {
      // Arrange
      const input = {
        name: 'Valid Name',
        email: 'invalid-email',
        password: 'Password123',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when password is empty', async () => {
      // Arrange
      const input = {
        name: 'Valid Name',
        email: 'valid@example.com',
        password: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('Conflict Errors', () => {
    it('should throw ConflictError when email already exists', async () => {
      // Arrange
      const firstInput = {
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'Password123',
      };
      const secondInput = {
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'DifferentPassword456',
      };

      // Act
      await useCase.execute(firstInput);

      // Assert
      await expect(useCase.execute(secondInput)).rejects.toThrow(ConflictError);
      await expect(useCase.execute(secondInput)).rejects.toThrow('email already exists');
    });
  });

  describe('Edge Cases', () => {
    it('should trim whitespace from name', async () => {
      // Arrange
      const input = {
        name: '  Spaces User  ',
        email: 'spaces@example.com',
        password: 'Password123',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.name).toBe('Spaces User');
    });

    it('should handle email case insensitivity', async () => {
      // Arrange
      const firstInput = {
        name: 'User One',
        email: 'CASE@EXAMPLE.COM',
        password: 'Password123',
      };
      const secondInput = {
        name: 'User Two',
        email: 'case@example.com',
        password: 'Password456',
      };

      // Act
      await useCase.execute(firstInput);

      // Assert
      await expect(useCase.execute(secondInput)).rejects.toThrow(ConflictError);
    });
  });
});

