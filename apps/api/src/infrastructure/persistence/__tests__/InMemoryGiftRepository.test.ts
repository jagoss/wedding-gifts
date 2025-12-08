import { InMemoryGiftRepository } from '../InMemoryGiftRepository';
import { Gift, GiftType } from '../../../domain/entities/Gift';
import { UniqueId, Money } from '../../../domain/value-objects';

describe('InMemoryGiftRepository', () => {
  let repository: InMemoryGiftRepository;

  beforeEach(() => {
    repository = new InMemoryGiftRepository();
  });

  describe('save', () => {
    it('should save and return gift', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const gift = Gift.create({
        weddingId,
        title: 'Coffee Maker',
        type: GiftType.PRODUCT,
        estimatedPrice: Money.create(1500, 'UYU'),
      });

      // Act
      const saved = await repository.save(gift);

      // Assert
      expect(saved).toBe(gift);
    });

    it('should update existing gift when saved again', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const gift = Gift.create({
        weddingId,
        title: 'Original Gift',
        type: GiftType.PRODUCT,
      });
      await repository.save(gift);

      // Act - update and save again
      gift.update({ title: 'Updated Gift' });
      await repository.save(gift);
      const found = await repository.findById(gift.id);

      // Assert
      expect(found?.title).toBe('Updated Gift');
    });
  });

  describe('findById', () => {
    it('should find saved gift by ID', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const gift = Gift.create({
        weddingId,
        title: 'Test Gift',
        type: GiftType.EXPERIENCE,
      });
      await repository.save(gift);

      // Act
      const found = await repository.findById(gift.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id.value).toBe(gift.id.value);
      expect(found?.title).toBe('Test Gift');
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

  describe('findByWeddingId', () => {
    it('should find all gifts for a wedding', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const gift1 = Gift.create({
        weddingId,
        title: 'Gift 1',
        type: GiftType.PRODUCT,
      });
      const gift2 = Gift.create({
        weddingId,
        title: 'Gift 2',
        type: GiftType.FUND,
      });
      await repository.save(gift1);
      await repository.save(gift2);

      // Act
      const gifts = await repository.findByWeddingId(weddingId);

      // Assert
      expect(gifts).toHaveLength(2);
      expect(gifts.map((g) => g.title)).toContain('Gift 1');
      expect(gifts.map((g) => g.title)).toContain('Gift 2');
    });

    it('should return empty array for wedding with no gifts', async () => {
      // Arrange
      const weddingId = UniqueId.create();

      // Act
      const gifts = await repository.findByWeddingId(weddingId);

      // Assert
      expect(gifts).toEqual([]);
    });

    it('should only return gifts for specific wedding', async () => {
      // Arrange
      const weddingId1 = UniqueId.create();
      const weddingId2 = UniqueId.create();
      const gift1 = Gift.create({
        weddingId: weddingId1,
        title: 'Wedding 1 Gift',
        type: GiftType.PRODUCT,
      });
      const gift2 = Gift.create({
        weddingId: weddingId2,
        title: 'Wedding 2 Gift',
        type: GiftType.EXPERIENCE,
      });
      await repository.save(gift1);
      await repository.save(gift2);

      // Act
      const wedding1Gifts = await repository.findByWeddingId(weddingId1);

      // Assert
      expect(wedding1Gifts).toHaveLength(1);
      expect(wedding1Gifts[0].title).toBe('Wedding 1 Gift');
    });
  });

  describe('delete', () => {
    it('should delete gift by ID', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const gift = Gift.create({
        weddingId,
        title: 'To Be Deleted',
        type: GiftType.PRODUCT,
      });
      await repository.save(gift);

      // Act
      await repository.delete(gift.id);
      const found = await repository.findById(gift.id);

      // Assert
      expect(found).toBeNull();
    });

    it('should not throw when deleting non-existent gift', async () => {
      // Arrange
      const id = UniqueId.create();

      // Act & Assert
      await expect(repository.delete(id)).resolves.not.toThrow();
    });
  });

  describe('persistence reconstruction', () => {
    it('should correctly reconstruct gift with money', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const gift = Gift.create({
        weddingId,
        title: 'Expensive Gift',
        type: GiftType.PRODUCT,
        estimatedPrice: Money.create(5000, 'UYU'),
      });
      await repository.save(gift);

      // Act
      const found = await repository.findById(gift.id);

      // Assert
      expect(found?.estimatedPrice).toBeDefined();
      expect(found?.estimatedPrice?.amount).toBe(5000);
      expect(found?.estimatedPrice?.currency).toBe('UYU');
    });
  });
});

