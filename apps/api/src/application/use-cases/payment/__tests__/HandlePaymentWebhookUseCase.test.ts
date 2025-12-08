import { HandlePaymentWebhookUseCase } from '../HandlePaymentWebhookUseCase';
import {
  MockContributionRepository,
  MockPaymentGateway,
  MockEmailService,
} from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { ValidationError } from '../../../../domain/errors/DomainError';

describe('HandlePaymentWebhookUseCase', () => {
  let useCase: HandlePaymentWebhookUseCase;
  let contributionRepository: MockContributionRepository;
  let paymentGateway: MockPaymentGateway;
  let emailService: MockEmailService;

  beforeEach(() => {
    contributionRepository = new MockContributionRepository();
    paymentGateway = new MockPaymentGateway();
    emailService = new MockEmailService();

    useCase = new HandlePaymentWebhookUseCase(
      contributionRepository,
      paymentGateway,
      emailService
    );
  });

  describe('Happy Path', () => {
    it('should process approved payment webhook', async () => {
      // Arrange
      const contribution = TestDataFactory.createContribution();
      await contributionRepository.save(contribution);

      // Create payment preference
      const preference = await paymentGateway.createPreference({
        contributionId: contribution.id.value,
        weddingId: 'wedding_123',
        amount: 5000,
        currency: 'USD',
        description: 'Test payment',
        payerEmail: 'test@example.com',
        payerName: 'Test User',
      });

      paymentGateway.setPaymentStatus(preference.preferenceId, 'approved');

      const input = {
        type: 'payment',
        data: {
          id: preference.preferenceId,
        },
      };

      // Act
      await useCase.execute(input);

      // Assert
      const updatedContribution = await contributionRepository.findById(contribution.id);
      expect(updatedContribution?.status).toBe('PAID');
      expect(emailService.sentEmails).toHaveLength(1);
      expect(emailService.sentEmails[0].type).toBe('contribution_paid');
    });

    it('should process rejected payment webhook', async () => {
      // Arrange
      const contribution = TestDataFactory.createContribution();
      await contributionRepository.save(contribution);

      const preference = await paymentGateway.createPreference({
        contributionId: contribution.id.value,
        weddingId: 'wedding_123',
        amount: 5000,
        currency: 'USD',
        description: 'Test payment',
        payerEmail: 'test@example.com',
        payerName: 'Test User',
      });

      paymentGateway.setPaymentStatus(preference.preferenceId, 'rejected');

      const input = {
        type: 'payment',
        data: {
          id: preference.preferenceId,
        },
      };

      // Act
      await useCase.execute(input);

      // Assert
      const updatedContribution = await contributionRepository.findById(contribution.id);
      expect(updatedContribution?.status).toBe('REJECTED');
      expect(emailService.sentEmails).toHaveLength(0);
    });

    it('should ignore non-payment webhook types', async () => {
      // Arrange
      const input = {
        type: 'subscription',
        data: {
          id: 'sub_123',
        },
      };

      // Act
      await useCase.execute(input);

      // Assert - Should not throw, just ignore
      expect(emailService.sentEmails).toHaveLength(0);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when webhook type is missing', async () => {
      // Arrange
      const input = {
        data: {
          id: 'payment_123',
        },
      } as any;

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(input)).rejects.toThrow('Webhook type is required');
    });

    it('should throw ValidationError when payment ID is missing', async () => {
      // Arrange
      const input = {
        type: 'payment',
        data: {},
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(input)).rejects.toThrow('Payment ID is required');
    });

    it('should throw ValidationError when data is missing', async () => {
      // Arrange
      const input = {
        type: 'payment',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle webhook for non-existent payment gracefully', async () => {
      // Arrange
      const input = {
        type: 'payment',
        data: {
          id: 'nonexistent_payment',
        },
      };

      // Act - Should not throw
      await useCase.execute(input);

      // Assert
      expect(emailService.sentEmails).toHaveLength(0);
    });

    it('should handle webhook for non-existent contribution gracefully', async () => {
      // Arrange
      const preference = await paymentGateway.createPreference({
        contributionId: 'nonexistent_contribution',
        weddingId: 'wedding_123',
        amount: 5000,
        currency: 'USD',
        description: 'Test',
        payerEmail: 'test@example.com',
        payerName: 'Test',
      });

      const input = {
        type: 'payment',
        data: {
          id: preference.preferenceId,
        },
      };

      // Act - Should not throw
      await useCase.execute(input);

      // Assert
      expect(emailService.sentEmails).toHaveLength(0);
    });

    it('should handle pending payment status', async () => {
      // Arrange
      const contribution = TestDataFactory.createContribution();
      await contributionRepository.save(contribution);

      const preference = await paymentGateway.createPreference({
        contributionId: contribution.id.value,
        weddingId: 'wedding_123',
        amount: 5000,
        currency: 'USD',
        description: 'Test',
        payerEmail: 'test@example.com',
        payerName: 'Test',
      });

      paymentGateway.setPaymentStatus(preference.preferenceId, 'pending');

      const input = {
        type: 'payment',
        data: {
          id: preference.preferenceId,
        },
      };

      // Act
      await useCase.execute(input);

      // Assert - Status should remain PENDING
      const updatedContribution = await contributionRepository.findById(contribution.id);
      expect(updatedContribution?.status).toBe('PENDING');
    });

    it('should not send email for contributions without amount', async () => {
      // Arrange
      const contribution = TestDataFactory.createContribution({
        amount: null,
        currency: null,
      });
      await contributionRepository.save(contribution);

      const preference = await paymentGateway.createPreference({
        contributionId: contribution.id.value,
        weddingId: 'wedding_123',
        amount: 0,
        currency: 'USD',
        description: 'Test',
        payerEmail: 'test@example.com',
        payerName: 'Test',
      });

      paymentGateway.setPaymentStatus(preference.preferenceId, 'approved');

      const input = {
        type: 'payment',
        data: {
          id: preference.preferenceId,
        },
      };

      // Act
      await useCase.execute(input);

      // Assert
      expect(emailService.sentEmails).toHaveLength(0);
    });
  });
});

