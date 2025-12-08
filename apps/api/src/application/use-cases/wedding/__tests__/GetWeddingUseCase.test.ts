import { GetWeddingUseCase } from '../GetWeddingUseCase';
import { MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError } from '../../../../domain/errors/DomainError';

describe('GetWeddingUseCase', () => {
  let useCase: GetWeddingUseCase;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    useCase = new GetWeddingUseCase(weddingRepository);
  });

  describe('Happy Path', () => {
    it('should get wedding by ID', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({
        title: 'Test Wedding',
        slug: 'test-wedding',
      });
      await weddingRepository.save(wedding);

      // Act
      const result = await useCase.execute(wedding.id.value);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(wedding.id.value);
      expect(result.title).toBe('Test Wedding');
      expect(result.slug).toBe('test-wedding');
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when wedding does not exist', async () => {
      // Arrange
      const nonExistentId = 'wed_nonexistent';

      // Act & Assert
      await expect(useCase.execute(nonExistentId)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(nonExistentId)).rejects.toThrow('Wedding');
    });
  });
});

