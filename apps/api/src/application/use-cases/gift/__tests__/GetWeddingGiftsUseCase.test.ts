import { GetWeddingGiftsUseCase } from '../GetWeddingGiftsUseCase';
import { MockGiftRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';

describe('GetWeddingGiftsUseCase', () => {
  let useCase: GetWeddingGiftsUseCase;
  let giftRepository: MockGiftRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    useCase = new GetWeddingGiftsUseCase(giftRepository);
  });

  describe('Happy Path', () => {
    it('should return all gifts for a wedding', async () => {
      // Arrange
      const weddingId = TestDataFactory.createId('wed_123');
      const gift1 = TestDataFactory.createGift({
        id: 'gift_1',
        weddingId: weddingId.value,
        title: 'Gift 1',
      });
      const gift2 = TestDataFactory.createGift({
        id: 'gift_2',
        weddingId: weddingId.value,
        title: 'Gift 2',
      });
      await giftRepository.save(gift1);
      await giftRepository.save(gift2);

      // Act
      const result = await useCase.execute(weddingId.value);

      // Assert
      expect(result).toHaveLength(2);
      const titles = result.map(g => g.title).sort();
      expect(titles).toEqual(['Gift 1', 'Gift 2']);
    });

    it('should return empty array when wedding has no gifts', async () => {
      // Arrange
      const weddingId = TestDataFactory.createId();

      // Act
      const result = await useCase.execute(weddingId.value);

      // Assert
      expect(result).toEqual([]);
    });

    it('should not return gifts from other weddings', async () => {
      // Arrange
      const wedding1Id = 'wed_1';
      const wedding2Id = 'wed_2';

      const gift1 = TestDataFactory.createGift({
        id: 'gift_for_wed1',
        weddingId: wedding1Id,
      });
      const gift2 = TestDataFactory.createGift({
        id: 'gift_for_wed2',
        weddingId: wedding2Id,
      });

      await giftRepository.save(gift1);
      await giftRepository.save(gift2);

      // Act
      const result = await useCase.execute(wedding1Id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(gift1.id.value);
    });
  });
});

