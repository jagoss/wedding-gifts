import { InMemoryUserRepository } from '../InMemoryUserRepository';
import { User } from '../../../domain/entities/User';
import { Email, UniqueId } from '../../../domain/value-objects';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe('save', () => {
    it('should save and return user', async () => {
      // Arrange
      const user = User.create(
        'Test User',
        Email.create('test@example.com'),
        'hashed_password'
      );

      // Act
      const saved = await repository.save(user);

      // Assert
      expect(saved).toBe(user);
    });
  });

  describe('findById', () => {
    it('should find saved user by ID', async () => {
      // Arrange
      const user = User.create('Test', Email.create('test@example.com'), 'hash');
      await repository.save(user);

      // Act
      const found = await repository.findById(user.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id.value).toBe(user.id.value);
    });

    it('should return null for non-existent ID', async () => {
      // Arrange
      const id = UniqueId.create();

      // Act
      const found = await repository.findById(id);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const user = User.create('Test', email, 'hash');
      await repository.save(user);

      // Act
      const found = await repository.findByEmail(email);

      // Assert
      expect(found).toBeDefined();
      expect(found?.email.value).toBe('test@example.com');
    });

    it('should handle case insensitivity', async () => {
      // Arrange
      const user = User.create('Test', Email.create('test@example.com'), 'hash');
      await repository.save(user);

      // Act
      const found = await repository.findByEmail(Email.create('TEST@EXAMPLE.COM'));

      // Assert
      expect(found).toBeDefined();
    });

    it('should return null for non-existent email', async () => {
      // Arrange
      const email = Email.create('nonexistent@example.com');

      // Act
      const found = await repository.findByEmail(email);

      // Assert
      expect(found).toBeNull();
    });
  });
});

