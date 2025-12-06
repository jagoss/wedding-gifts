import { User } from '../User';
import { Email } from '../../value-objects/Email';
import { UniqueId } from '../../value-objects/UniqueId';
import { ValidationError } from '../../errors/DomainError';

describe('User', () => {
  describe('Happy Path', () => {
    it('should create a user with valid data', () => {
      // Arrange
      const email = Email.create('user@example.com');

      // Act
      const user = User.create('John Doe', email, 'hashed_password');

      // Assert
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email.value).toBe('user@example.com');
      expect(user.passwordHash).toBe('hashed_password');
    });

    it('should trim name whitespace', () => {
      // Arrange
      const email = Email.create('user@example.com');

      // Act
      const user = User.create('  John Doe  ', email, 'hashed_password');

      // Assert
      expect(user.name).toBe('John Doe');
    });

    it('should generate unique ID', () => {
      // Arrange
      const email = Email.create('user@example.com');

      // Act
      const user1 = User.create('User 1', email, 'hash1');
      const user2 = User.create('User 2', email, 'hash2');

      // Assert
      expect(user1.id.value).not.toBe(user2.id.value);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for empty name', () => {
      // Arrange
      const email = Email.create('user@example.com');

      // Act & Assert
      expect(() => User.create('', email, 'hashed_password')).toThrow(ValidationError);
      expect(() => User.create('', email, 'hashed_password')).toThrow('User name is required');
    });

    it('should throw ValidationError for whitespace-only name', () => {
      // Arrange
      const email = Email.create('user@example.com');

      // Act & Assert
      expect(() => User.create('   ', email, 'hashed_password')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty password hash', () => {
      // Arrange
      const email = Email.create('user@example.com');

      // Act & Assert
      expect(() => User.create('John Doe', email, '')).toThrow(ValidationError);
      expect(() => User.create('John Doe', email, '')).toThrow('Password hash is required');
    });
  });

  describe('Persistence', () => {
    it('should convert to persistence format', () => {
      // Arrange
      const email = Email.create('user@example.com');
      const user = User.create('John Doe', email, 'hashed_password');

      // Act
      const data = user.toPersistence();

      // Assert
      expect(data).toEqual({
        id: user.id.value,
        name: 'John Doe',
        email: 'user@example.com',
        passwordHash: 'hashed_password',
      });
    });

    it('should reconstruct from persistence', () => {
      // Arrange
      const data = {
        id: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        passwordHash: 'hashed_pass',
      };

      // Act
      const user = User.fromPersistence(data);

      // Assert
      expect(user.id.value).toBe('user-123');
      expect(user.name).toBe('Jane Doe');
      expect(user.email.value).toBe('jane@example.com');
      expect(user.passwordHash).toBe('hashed_pass');
    });
  });
});

