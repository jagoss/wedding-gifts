import { UpdateGiftUseCase } from '../UpdateGiftUseCase';
import { MockGiftRepository, MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, ValidationError, UnauthorizedError } from '../../../../domain/errors/DomainError';
import { GiftStatus } from '../../../../domain/entities/Gift';

describe('UpdateGiftUseCase', () => {
  let useCase: UpdateGiftUseCase;
  let giftRepository: MockGiftRepository;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    weddingRepository = new MockWeddingRepository();
    useCase = new UpdateGiftUseCase(giftRepository, weddingRepository);
  });

  describe('Happy Path', () => {
    it('should update gift fields', async () => {
      // Arrange
      const gift = TestDataFactory.createGift({
        title: 'Original Title',
        description: 'Original Description',
      });
      const wedding = TestDataFactory.createWedding({ id: gift.weddingId.value, userId: 'user-1' });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        userId: wedding.userId.value,
        giftId: gift.id.value,
        title: 'Updated Title',
        description: 'Updated Description',
        estimatedPrice: 20000,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
    });

    it('should update gift status', async () => {
      // Arrange
      const gift = TestDataFactory.createGift();
      const wedding = TestDataFactory.createWedding({ id: gift.weddingId.value, userId: 'user-1' });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        userId: wedding.userId.value,
        giftId: gift.id.value,
        status: GiftStatus.RESERVED,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.status).toBe('RESERVED');
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when gift does not exist', async () => {
      // Arrange
      const input = {
        userId: 'user-1',
        giftId: 'gift_nonexistent',
        title: 'New Title',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw UnauthorizedError when user does not own wedding', async () => {
      // Arrange
      const gift = TestDataFactory.createGift();
      const wedding = TestDataFactory.createWedding({ id: gift.weddingId.value, userId: 'owner-1' });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        userId: 'another-user',
        giftId: gift.id.value,
        title: 'New Title',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedError);
      await expect(useCase.execute(input)).rejects.toThrow('You do not own this wedding');
    });
  });
});

