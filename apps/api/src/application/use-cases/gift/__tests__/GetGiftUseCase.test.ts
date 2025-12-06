import { GetGiftUseCase } from '../GetGiftUseCase';
import { MockGiftRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError } from '../../../../domain/errors/DomainError';

describe('GetGiftUseCase', () => {
  let useCase: GetGiftUseCase;
  let giftRepository: MockGiftRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    useCase = new GetGiftUseCase(giftRepository);
  });

  describe('Happy Path', () => {
    it('should get gift by ID', async () => {
      // Arrange
      const gift = TestDataFactory.createGift({
        title: 'Test Gift',
      });
      await giftRepository.save(gift);

      // Act
      const result = await useCase.execute(gift.id.value);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(gift.id.value);
      expect(result.title).toBe('Test Gift');
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when gift does not exist', async () => {
      // Arrange
      const nonExistentId = 'gift_nonexistent';

      // Act & Assert
      await expect(useCase.execute(nonExistentId)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(useCase.execute(nonExistentId)).rejects.toThrow('Gift');
    });
  });
});

