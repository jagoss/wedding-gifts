import { GetUserWeddingsUseCase } from '../GetUserWeddingsUseCase';
import { MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';

describe('GetUserWeddingsUseCase', () => {
  let useCase: GetUserWeddingsUseCase;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    useCase = new GetUserWeddingsUseCase(weddingRepository);
  });

  describe('Happy Path', () => {
    it('should return all weddings for a user', async () => {
      // Arrange
      const userId = TestDataFactory.createId('user_123');
      const wedding1 = TestDataFactory.createWedding({
        id: 'wed_1',
        userId: userId.value,
        title: 'First Wedding',
        slug: 'first-wedding',
      });
      const wedding2 = TestDataFactory.createWedding({
        id: 'wed_2',
        userId: userId.value,
        title: 'Second Wedding',
        slug: 'second-wedding',
      });
      await weddingRepository.save(wedding1);
      await weddingRepository.save(wedding2);

      // Act
      const result = await useCase.execute(userId.value);

      // Assert
      expect(result).toHaveLength(2);
      const titles = result.map(w => w.title).sort();
      expect(titles).toEqual(['First Wedding', 'Second Wedding']);
    });

    it('should return empty array when user has no weddings', async () => {
      // Arrange
      const userId = TestDataFactory.createId();

      // Act
      const result = await useCase.execute(userId.value);

      // Assert
      expect(result).toEqual([]);
    });

    it('should not return weddings from other users', async () => {
      // Arrange
      const user1Id = 'user_1';
      const user2Id = 'user_2';

      const wedding1 = TestDataFactory.createWedding({
        id: 'wed_for_user1',
        userId: user1Id,
        slug: 'wedding-user1',
      });
      const wedding2 = TestDataFactory.createWedding({
        id: 'wed_for_user2',
        userId: user2Id,
        slug: 'wedding-user2',
      });

      await weddingRepository.save(wedding1);
      await weddingRepository.save(wedding2);

      // Act
      const result = await useCase.execute(user1Id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(wedding1.id.value);
    });
  });
});

