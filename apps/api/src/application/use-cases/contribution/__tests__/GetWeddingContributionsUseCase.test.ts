import { GetWeddingContributionsUseCase } from '../GetWeddingContributionsUseCase';
import { MockContributionRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';

describe('GetWeddingContributionsUseCase', () => {
  let useCase: GetWeddingContributionsUseCase;
  let contributionRepository: MockContributionRepository;

  beforeEach(() => {
    contributionRepository = new MockContributionRepository();
    useCase = new GetWeddingContributionsUseCase(contributionRepository);
  });

  describe('Happy Path', () => {
    it('should return all contributions for a wedding', async () => {
      // Arrange
      const weddingId = TestDataFactory.createId('wed_123');
      const contrib1 = TestDataFactory.createContribution({
        weddingId: weddingId.value,
        guestName: 'Guest 1',
      });
      const contrib2 = TestDataFactory.createContribution({
        weddingId: weddingId.value,
        guestName: 'Guest 2',
      });
      await contributionRepository.save(contrib1);
      await contributionRepository.save(contrib2);

      // Act
      const result = await useCase.execute(weddingId.value);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].guestName).toBe('Guest 1');
      expect(result[1].guestName).toBe('Guest 2');
    });

    it('should return empty array when wedding has no contributions', async () => {
      // Arrange
      const weddingId = TestDataFactory.createId();

      // Act
      const result = await useCase.execute(weddingId.value);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

