import { Wedding, BankAccountType } from '../Wedding';
import { UniqueId, Slug } from '../../value-objects';
import { ValidationError, UnauthorizedError } from '../../errors/DomainError';

describe('Wedding', () => {
  describe('Happy Path', () => {
    it('should create wedding with all fields', () => {
      // Arrange
      const userId = UniqueId.create();
      const slug = Slug.create('test-wedding');

      // Act
      const wedding = Wedding.create({
        userId,
        title: 'Test Wedding',
        slug,
        date: '2026-06-15',
        location: 'Buenos Aires',
        message: 'Join us!',
        heroImageUrl: 'https://example.com/hero.jpg',
        bankAccounts: [{
          id: 'acc_1',
          type: BankAccountType.MERCADOPAGO,
          label: 'MercadoPago',
          details: { alias: 'test' },
        }],
      });

      // Assert
      expect(wedding.title).toBe('Test Wedding');
      expect(wedding.slug.value).toBe('test-wedding');
      expect(wedding.location).toBe('Buenos Aires');
    });

    it('should create wedding with minimal fields', () => {
      // Arrange
      const userId = UniqueId.create();
      const slug = Slug.create('minimal');

      // Act
      const wedding = Wedding.create({ userId, title: 'Minimal', slug });

      // Assert
      expect(wedding.title).toBe('Minimal');
      expect(wedding.date).toBeNull();
      expect(wedding.bankAccounts).toEqual([]);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for empty title', () => {
      // Arrange
      const userId = UniqueId.create();
      const slug = Slug.create('test');

      // Act & Assert
      expect(() => Wedding.create({ userId, title: '', slug })).toThrow(ValidationError);
    });
  });

  describe('Update', () => {
    it('should update fields when user is owner', () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding = Wedding.create({
        userId,
        title: 'Original',
        slug: Slug.create('original'),
      });

      // Act
      wedding.update(userId, { title: 'Updated', location: 'New Location' });

      // Assert
      expect(wedding.title).toBe('Updated');
      expect(wedding.location).toBe('New Location');
    });

    it('should throw UnauthorizedError when user is not owner', () => {
      // Arrange
      const owner = UniqueId.create();
      const other = UniqueId.create();
      const wedding = Wedding.create({
        userId: owner,
        title: 'Test',
        slug: Slug.create('test'),
      });

      // Act & Assert
      expect(() => wedding.update(other, { title: 'Updated' })).toThrow(UnauthorizedError);
    });
  });

  describe('Persistence', () => {
    it('should convert to and from persistence', () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding = Wedding.create({
        userId,
        title: 'Test',
        slug: Slug.create('test'),
      });

      // Act
      const data = wedding.toPersistence();
      const reconstructed = Wedding.fromPersistence(data);

      // Assert
      expect(reconstructed.id.value).toBe(wedding.id.value);
      expect(reconstructed.title).toBe(wedding.title);
    });
  });
});

