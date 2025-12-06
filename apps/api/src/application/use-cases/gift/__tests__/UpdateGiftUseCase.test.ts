import { UpdateGiftUseCase } from '../UpdateGiftUseCase';
import { MockGiftRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, ValidationError } from '../../../../domain/errors/DomainError';
import { GiftStatus } from '../../../../domain/entities/Gift';

describe('UpdateGiftUseCase', () => {
  let useCase: UpdateGiftUseCase;
  let giftRepository: MockGiftRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    useCase = new UpdateGiftUseCase(giftRepository);
  });

  describe('Happy Path', () => {
    it('should update gift fields', async () => {
      // Arrange
      const gift = TestDataFactory.createGift({
        title: 'Original Title',
        description: 'Original Description',
      });
      await giftRepository.save(gift);

      const input = {
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
      await giftRepository.save(gift);

      const input = {
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
        giftId: 'gift_nonexistent',
        title: 'New Title',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
    });
  });
});

