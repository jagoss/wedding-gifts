import { CreateContributionUseCase } from '../CreateContributionUseCase';
import {
  MockWeddingRepository,
  MockGiftRepository,
  MockContributionRepository,
  MockEmailService,
  MockPaymentGateway,
} from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { EntityNotFoundError, ValidationError } from '../../../../domain/errors/DomainError';
import { ContributionType, PaymentProvider } from '../../../../domain/entities/Contribution';

describe('CreateContributionUseCase', () => {
  let useCase: CreateContributionUseCase;
  let weddingRepository: MockWeddingRepository;
  let giftRepository: MockGiftRepository;
  let contributionRepository: MockContributionRepository;
  let emailService: MockEmailService;
  let paymentGateway: MockPaymentGateway;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    giftRepository = new MockGiftRepository();
    contributionRepository = new MockContributionRepository();
    emailService = new MockEmailService();
    paymentGateway = new MockPaymentGateway();

    useCase = new CreateContributionUseCase(
      weddingRepository,
      giftRepository,
      contributionRepository,
      emailService,
      paymentGateway
    );
  });

  describe('Happy Path', () => {
    it('should create a contribution with MercadoPago payment', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({ slug: 'test-wedding' });
      const gift = TestDataFactory.createGift({ weddingId: wedding.id.value });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: 'test-wedding',
        giftId: gift.id.value,
        guestName: 'María González',
        guestEmail: 'maria@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 5000,
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.contributionId).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(result.payment).toBeDefined();
      expect(result.payment?.provider).toBe('MERCADOPAGO');
      expect(result.payment?.preferenceId).toBeDefined();
      expect(result.payment?.checkoutUrl).toContain('checkout');
    });

    it('should create a contribution with bank transfer', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({ slug: 'bank-wedding' });
      const gift = TestDataFactory.createGift({ weddingId: wedding.id.value });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: 'bank-wedding',
        giftId: gift.id.value,
        guestName: 'Carlos Rodríguez',
        guestEmail: 'carlos@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 10000,
        paymentMethod: PaymentProvider.BANK_TRANSFER,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.contributionId).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(result.payment).toBeNull();
    });

    it('should send confirmation email', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({ slug: 'email-test' });
      const gift = TestDataFactory.createGift({
        weddingId: wedding.id.value,
        title: 'Coffee Maker',
      });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: 'email-test',
        giftId: gift.id.value,
        guestName: 'Email User',
        guestEmail: 'email@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 3000,
        paymentMethod: PaymentProvider.BANK_TRANSFER,
      };

      // Act
      await useCase.execute(input);

      // Assert
      expect(emailService.sentEmails).toHaveLength(1);
      expect(emailService.sentEmails[0].to).toBe('email@example.com');
      expect(emailService.sentEmails[0].type).toBe('contribution_created');
      expect(emailService.sentEmails[0].data.giftTitle).toBe('Coffee Maker');
    });

    it('should use gift currency when not specified', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      const gift = TestDataFactory.createGift({
        weddingId: wedding.id.value,
        currency: 'ARS',
        estimatedPrice: 15000,
      });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: wedding.slug.value,
        giftId: gift.id.value,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 5000,
        // No currency specified
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      const savedContribution = await contributionRepository.findById(
        TestDataFactory.createId(result.contributionId)
      );
      expect(savedContribution?.amount?.currency).toBe('ARS');
    });
  });

  describe('Not Found Errors', () => {
    it('should throw EntityNotFoundError when wedding does not exist', async () => {
      // Arrange
      const input = {
        weddingSlug: 'nonexistent-wedding',
        giftId: 'gift_123',
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 5000,
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(input)).rejects.toThrow('Wedding');
    });

    it('should throw EntityNotFoundError when gift does not exist', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding({ slug: 'valid-wedding' });
      await weddingRepository.save(wedding);

      const input = {
        weddingSlug: 'valid-wedding',
        giftId: 'nonexistent_gift',
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 5000,
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(input)).rejects.toThrow('Gift');
    });

    it('should throw EntityNotFoundError when gift belongs to different wedding', async () => {
      // Arrange
      const wedding1 = TestDataFactory.createWedding({ slug: 'wedding-1' });
      const wedding2 = TestDataFactory.createWedding({ slug: 'wedding-2' });
      const gift = TestDataFactory.createGift({ weddingId: wedding2.id.value });

      await weddingRepository.save(wedding1);
      await weddingRepository.save(wedding2);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: 'wedding-1',
        giftId: gift.id.value,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 5000,
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when guest email is invalid', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      const gift = TestDataFactory.createGift({ weddingId: wedding.id.value });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: wedding.slug.value,
        giftId: gift.id.value,
        guestName: 'Test User',
        guestEmail: 'invalid-email',
        type: ContributionType.CONTRIBUTION,
        amount: 5000,
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when amount is missing for CONTRIBUTION type', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      const gift = TestDataFactory.createGift({ weddingId: wedding.id.value });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: wedding.slug.value,
        giftId: gift.id.value,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.CONTRIBUTION,
        // amount is missing
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(input)).rejects.toThrow('Amount is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle reservation without amount', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      const gift = TestDataFactory.createGift({ weddingId: wedding.id.value });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: wedding.slug.value,
        giftId: gift.id.value,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.RESERVATION,
        // No amount for reservation
        paymentMethod: PaymentProvider.BANK_TRANSFER,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.contributionId).toBeDefined();
    });

    it('should default to USD when no currency available', async () => {
      // Arrange
      const wedding = TestDataFactory.createWedding();
      const gift = TestDataFactory.createGift({
        weddingId: wedding.id.value,
        currency: null,
        estimatedPrice: null,
      });
      await weddingRepository.save(wedding);
      await giftRepository.save(gift);

      const input = {
        weddingSlug: wedding.slug.value,
        giftId: gift.id.value,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 100,
        paymentMethod: PaymentProvider.MERCADOPAGO,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      const contribution = await contributionRepository.findById(
        TestDataFactory.createId(result.contributionId)
      );
      expect(contribution?.amount?.currency).toBe('USD');
    });
  });
});

