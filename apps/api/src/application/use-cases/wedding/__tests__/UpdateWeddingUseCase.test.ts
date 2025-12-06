import { UpdateWeddingUseCase } from '../UpdateWeddingUseCase';
import { MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, ValidationError, ConflictError } from '../../../../domain/errors/DomainError';

describe('UpdateWeddingUseCase', () => {
  let useCase: UpdateWeddingUseCase;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    useCase = new UpdateWeddingUseCase(weddingRepository);
  });

  describe('Happy Path', () => {
    it('should update wedding fields', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({
        title: 'Original Title',
        location: 'Original Location',
      });
      await weddingRepository.save(wedding);

      const input = {
        weddingId: wedding.id.value,
        userId: wedding.userId.value,
        title: 'Updated Title',
        location: 'New Location',
        message: 'New message',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.title).toBe('Updated Title');
      expect(result.location).toBe('New Location');
      expect(result.message).toBe('New message');
    });

    it('should update only specified fields', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({
        title: 'Original Title',
        location: 'Original Location',
      });
      await weddingRepository.save(wedding);

      const input = {
        weddingId: wedding.id.value,
        userId: wedding.userId.value,
        title: 'New Title',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.title).toBe('New Title');
      expect(result.location).toBe('Original Location');
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when wedding does not exist', async () => {
      // Arrange
      const input = {
        weddingId: 'wed_nonexistent',
        userId: TestDataFactory.createId().value,
        title: 'New Title',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when title is empty', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      await weddingRepository.save(wedding);

      const input = {
        weddingId: wedding.id.value,
        userId: wedding.userId.value,
        title: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });
});

