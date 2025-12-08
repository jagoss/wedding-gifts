import { CreatePaymentPreferenceUseCase } from '../CreatePaymentPreferenceUseCase';
import { MockContributionRepository, MockPaymentGateway } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, ValidationError } from '../../../../domain/errors/DomainError';

describe('CreatePaymentPreferenceUseCase', () => {
  let useCase: CreatePaymentPreferenceUseCase;
  let contributionRepository: MockContributionRepository;
  let paymentGateway: MockPaymentGateway;

  beforeEach(() => {
    contributionRepository = new MockContributionRepository();
    paymentGateway = new MockPaymentGateway();
    useCase = new CreatePaymentPreferenceUseCase(contributionRepository, paymentGateway);
  });

  describe('Happy Path', () => {
    it('should create payment preference for contribution', async () => {
      // Arrange
      const contribution = TestDataFactory.createContribution({
        amount: 10000,
        currency: 'ARS',
      });
      await contributionRepository.save(contribution);

      const input = {
        contributionId: contribution.id.value,
        weddingId: 'wed_123',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.preferenceId).toBeDefined();
      expect(result.checkoutUrl).toContain('checkout');
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when contribution does not exist', async () => {
      // Arrange
      const input = {
        contributionId: 'contrib_nonexistent',
        weddingId: 'wed_123',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(input)).rejects.toThrow('Contribution');
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when contribution has no amount', async () => {
      // Arrange
      const contribution = TestDataFactory.createContribution({
        amount: null,
        currency: null,
      });
      await contributionRepository.save(contribution);

      const input = {
        contributionId: contribution.id.value,
        weddingId: 'wed_123',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(input)).rejects.toThrow('no amount');
    });
  });
});

