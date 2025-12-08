import { DeleteWeddingUseCase } from '../DeleteWeddingUseCase';
import { MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError } from '../../../../domain/errors/DomainError';

describe('DeleteWeddingUseCase', () => {
  let useCase: DeleteWeddingUseCase;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    useCase = new DeleteWeddingUseCase(weddingRepository);
  });

  describe('Happy Path', () => {
    it('should delete an existing wedding', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      await weddingRepository.save(wedding);

      // Act
      await useCase.execute({
        weddingId: wedding.id.value,
        userId: wedding.userId.value,
      });

      // Assert
      const deletedWedding = await weddingRepository.findById(wedding.id);
      expect(deletedWedding).toBeNull();
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when wedding does not exist', async () => {
      // Arrange
      const nonExistentId = 'wed_nonexistent';

      // Act & Assert
      await expect(
        useCase.execute({
          weddingId: nonExistentId,
          userId: TestDataFactory.createId().value,
        })
      ).rejects.toThrow(EntityNotFoundError);
    });
  });
});

