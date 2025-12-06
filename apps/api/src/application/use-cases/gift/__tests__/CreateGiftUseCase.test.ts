import { CreateGiftUseCase } from '../CreateGiftUseCase';
import { MockGiftRepository, MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, ValidationError } from '../../../../domain/errors/DomainError';
import { GiftType } from '../../../../domain/entities/Gift';

describe('CreateGiftUseCase', () => {
  let useCase: CreateGiftUseCase;
  let giftRepository: MockGiftRepository;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    giftRepository = new MockGiftRepository();
    weddingRepository = new MockWeddingRepository();
    useCase = new CreateGiftUseCase(giftRepository, weddingRepository);
  });

  describe('Happy Path', () => {
    it('should create a product gift with all fields', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      await weddingRepository.save(wedding);

      const input = {
        weddingId: wedding.id.value,
        title: 'Coffee Maker',
        description: 'Italian espresso maker',
        estimatedPrice: 15000,
        currency: 'ARS',
        imageUrl: 'https://example.com/coffee.jpg',
        productUrl: 'https://store.com/coffee-maker',
        type: GiftType.PRODUCT,
        maxContributions: 1,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Coffee Maker');
      expect(result.type).toBe('PRODUCT');
      expect(result.status).toBe('AVAILABLE');
    });

    it('should create a gift with minimal fields', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      await weddingRepository.save(wedding);

      const input = {
        weddingId: wedding.id.value,
        title: 'Simple Gift',
        type: GiftType.FUND,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.title).toBe('Simple Gift');
      expect(result.type).toBe('FUND');
      expect(result.description).toBeNull();
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when wedding does not exist', async () => {
      // Arrange
      const input = {
        weddingId: 'wed_nonexistent',
        title: 'Gift',
        type: GiftType.PRODUCT,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(input)).rejects.toThrow('Wedding');
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when title is empty', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      await weddingRepository.save(wedding);

      const input = {
        weddingId: wedding.id.value,
        title: '',
        type: GiftType.PRODUCT,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });
});

