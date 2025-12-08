import { GetWeddingBySlugUseCase } from '../GetWeddingBySlugUseCase';
import { MockWeddingRepository, MockGiftRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError } from '../../../../domain/errors/DomainError';

describe('GetWeddingBySlugUseCase', () => {
  let useCase: GetWeddingBySlugUseCase;
  let weddingRepository: MockWeddingRepository;
  let giftRepository: MockGiftRepository;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    giftRepository = new MockGiftRepository();
    useCase = new GetWeddingBySlugUseCase(weddingRepository, giftRepository);
  });

  describe('Happy Path', () => {
    it('should get wedding and gifts by slug', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({
        id: 'wed_public',
        title: 'Public Wedding',
        slug: 'public-wedding',
      });
      await weddingRepository.save(wedding);
      
      const gift1 = TestDataFactory.createGift({
        id: 'gift_1',
        weddingId: wedding.id.value,
        title: 'Gift 1',
      });
      const gift2 = TestDataFactory.createGift({
        id: 'gift_2',
        weddingId: wedding.id.value,
        title: 'Gift 2',
      });

      await giftRepository.save(gift1);
      await giftRepository.save(gift2);

      // Act
      const result = await useCase.execute('public-wedding');

      // Assert
      expect(result).toBeDefined();
      expect(result.wedding).toBeDefined();
      expect(result.wedding.title).toBe('Public Wedding');
      expect(result.gifts).toHaveLength(2);
      expect(result.gifts.find(g => g.title === 'Gift 1')).toBeDefined();
      expect(result.gifts.find(g => g.title === 'Gift 2')).toBeDefined();
    });

    it('should return empty gifts array when wedding has no gifts', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({ slug: 'no-gifts' });
      await weddingRepository.save(wedding);

      // Act
      const result = await useCase.execute('no-gifts');

      // Assert
      expect(result.wedding).toBeDefined();
      expect(result.gifts).toEqual([]);
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when slug does not exist', async () => {
      // Arrange
      const nonExistentSlug = 'nonexistent-slug';

      // Act & Assert
      await expect(useCase.execute(nonExistentSlug)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(useCase.execute(nonExistentSlug)).rejects.toThrow('Wedding');
    });
  });
});

