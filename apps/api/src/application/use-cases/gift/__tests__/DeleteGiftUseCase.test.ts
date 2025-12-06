import { DeleteGiftUseCase } from '../DeleteGiftUseCase';
import { MockGiftRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError } from '../../../../domain/errors/DomainError';

describe('DeleteGiftUseCase', () => {
  let useCase: DeleteGiftUseCase;
  let giftRepository: MockGiftRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    useCase = new DeleteGiftUseCase(giftRepository);
  });

  describe('Happy Path', () => {
    it('should delete an existing gift', async () => {
      // Arrange
      const gift = TestDataFactory.createGift();
      await giftRepository.save(gift);

      // Act
      await useCase.execute(gift.id.value);

      // Assert
      const deletedGift = await giftRepository.findById(gift.id);
      expect(deletedGift).toBeNull();
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

