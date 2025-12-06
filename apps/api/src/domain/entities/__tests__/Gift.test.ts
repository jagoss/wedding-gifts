import { Gift, GiftType, GiftStatus } from '../Gift';
import { UniqueId, Money } from '../../value-objects';
import { ValidationError } from '../../errors/DomainError';

describe('Gift', () => {
  describe('Happy Path', () => {
    it('should create product gift', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const price = Money.create(10000, 'ARS');

      // Act
      const gift = Gift.create({
        weddingId,
        title: 'Coffee Maker',
        type: GiftType.PRODUCT,
        estimatedPrice: price,
      });

      // Assert
      expect(gift.title).toBe('Coffee Maker');
      expect(gift.type).toBe(GiftType.PRODUCT);
      expect(gift.status).toBe(GiftStatus.AVAILABLE);
    });

    it('should create fund gift', () => {
      // Arrange
      const weddingId = UniqueId.create();

      // Act
      const gift = Gift.create({
        weddingId,
        title: 'Honeymoon Fund',
        type: GiftType.FUND,
      });

      // Assert
      expect(gift.type).toBe(GiftType.FUND);
      expect(gift.estimatedPrice).toBeNull();
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for empty title', () => {
      // Arrange
      const weddingId = UniqueId.create();

      // Act & Assert
      expect(() => Gift.create({ weddingId, title: '', type: GiftType.PRODUCT })).toThrow(ValidationError);
    });
  });

  describe('Update', () => {
    it('should update gift fields', () => {
      // Arrange
      const gift = Gift.create({
        weddingId: UniqueId.create(),
        title: 'Original',
        type: GiftType.PRODUCT,
      });

      // Act
      gift.update({ title: 'Updated', status: GiftStatus.RESERVED });

      // Assert
      expect(gift.title).toBe('Updated');
      expect(gift.status).toBe(GiftStatus.RESERVED);
    });
  });

  describe('Persistence', () => {
    it('should convert to and from persistence', () => {
      // Arrange
      const gift = Gift.create({
        weddingId: UniqueId.create(),
        title: 'Test Gift',
        type: GiftType.PRODUCT,
      });

      // Act
      const data = gift.toPersistence();
      const reconstructed = Gift.fromPersistence(data);

      // Assert
      expect(reconstructed.title).toBe(gift.title);
      expect(reconstructed.type).toBe(gift.type);
    });
  });
});

