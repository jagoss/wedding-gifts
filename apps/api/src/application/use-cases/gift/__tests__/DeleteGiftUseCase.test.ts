import { DeleteGiftUseCase } from '../DeleteGiftUseCase';
import { MockGiftRepository, MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, UnauthorizedError } from '../../../../domain/errors/DomainError';

describe('DeleteGiftUseCase', () => {
  let useCase: DeleteGiftUseCase;
  let giftRepository: MockGiftRepository;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    weddingRepository = new MockWeddingRepository();
    useCase = new DeleteGiftUseCase(giftRepository, weddingRepository);
  });

  describe('Happy Path', () => {
    it('should delete an existing gift', async () => {
      // Arrange
      const gift = TestDataFactory.createGift();
      const wedding = TestDataFactory.createWedding({ id: gift.weddingId.value, userId: 'owner-1' });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      // Act
      await useCase.execute({ giftId: gift.id.value, userId: wedding.userId.value });

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
      await expect(useCase.execute({ giftId: nonExistentId, userId: 'user-1' })).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(useCase.execute({ giftId: nonExistentId, userId: 'user-1' })).rejects.toThrow('Gift');
    });

    it('should throw UnauthorizedError when user does not own wedding', async () => {
      // Arrange
      const gift = TestDataFactory.createGift();
      const wedding = TestDataFactory.createWedding({ id: gift.weddingId.value, userId: 'owner-1' });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      // Act & Assert
      await expect(
        useCase.execute({ giftId: gift.id.value, userId: 'other-user' })
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        useCase.execute({ giftId: gift.id.value, userId: 'other-user' })
      ).rejects.toThrow('You do not own this wedding');
    });
  });
});

