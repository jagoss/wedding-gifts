import { InMemoryContributionRepository } from '../InMemoryContributionRepository';
import {
  Contribution,
  ContributionType,
  ContributionStatus,
  PaymentProvider,
} from '../../../domain/entities/Contribution';
import { UniqueId, Money, Email } from '../../../domain/value-objects';

describe('InMemoryContributionRepository', () => {
  let repository: InMemoryContributionRepository;

  beforeEach(() => {
    repository = new InMemoryContributionRepository();
  });

  describe('save', () => {
    it('should save and return contribution', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'John Doe',
        guestEmail: Email.create('john@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(500, 'UYU'),
        paymentProvider: PaymentProvider.MERCADOPAGO,
      });

      // Act
      const saved = await repository.save(contribution);

      // Assert
      expect(saved).toBe(contribution);
    });

    it('should update existing contribution when saved again', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Jane Smith',
        guestEmail: Email.create('jane@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });
      await repository.save(contribution);

      // Act - update status and save again
      contribution.markAsPaid('payment-123');
      await repository.save(contribution);
      const found = await repository.findById(contribution.id);

      // Assert
      expect(found?.status).toBe(ContributionStatus.PAID);
      expect(found?.paymentProviderId).toBe('payment-123');
    });
  });

  describe('findById', () => {
    it('should find saved contribution by ID', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(750, 'UYU'),
      });
      await repository.save(contribution);

      // Act
      const found = await repository.findById(contribution.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id.value).toBe(contribution.id.value);
      expect(found?.guestName).toBe('Test Guest');
    });

    it('should return null for non-existent ID', async () => {
      // Arrange
      const id = UniqueId.create();

      // Act
      const found = await repository.findById(id);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByWeddingId', () => {
    it('should find all contributions for a wedding', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId1 = UniqueId.create();
      const giftId2 = UniqueId.create();
      const contribution1 = Contribution.create({
        weddingId,
        giftId: giftId1,
        guestName: 'Guest 1',
        guestEmail: Email.create('guest1@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(500, 'UYU'),
      });
      const contribution2 = Contribution.create({
        weddingId,
        giftId: giftId2,
        guestName: 'Guest 2',
        guestEmail: Email.create('guest2@example.com'),
        type: ContributionType.RESERVATION,
      });
      await repository.save(contribution1);
      await repository.save(contribution2);

      // Act
      const contributions = await repository.findByWeddingId(weddingId);

      // Assert
      expect(contributions).toHaveLength(2);
      expect(contributions.map((c) => c.guestName)).toContain('Guest 1');
      expect(contributions.map((c) => c.guestName)).toContain('Guest 2');
    });

    it('should return empty array for wedding with no contributions', async () => {
      // Arrange
      const weddingId = UniqueId.create();

      // Act
      const contributions = await repository.findByWeddingId(weddingId);

      // Assert
      expect(contributions).toEqual([]);
    });

    it('should only return contributions for specific wedding', async () => {
      // Arrange
      const weddingId1 = UniqueId.create();
      const weddingId2 = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution1 = Contribution.create({
        weddingId: weddingId1,
        giftId,
        guestName: 'Wedding 1 Guest',
        guestEmail: Email.create('wedding1@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(500, 'UYU'),
      });
      const contribution2 = Contribution.create({
        weddingId: weddingId2,
        giftId,
        guestName: 'Wedding 2 Guest',
        guestEmail: Email.create('wedding2@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(500, 'UYU'),
      });
      await repository.save(contribution1);
      await repository.save(contribution2);

      // Act
      const wedding1Contributions = await repository.findByWeddingId(weddingId1);

      // Assert
      expect(wedding1Contributions).toHaveLength(1);
      expect(wedding1Contributions[0].guestName).toBe('Wedding 1 Guest');
    });
  });

  describe('findByGiftId', () => {
    it('should find all contributions for a gift', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution1 = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Contributor 1',
        guestEmail: Email.create('contrib1@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(300, 'UYU'),
      });
      const contribution2 = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Contributor 2',
        guestEmail: Email.create('contrib2@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(700, 'UYU'),
      });
      await repository.save(contribution1);
      await repository.save(contribution2);

      // Act
      const contributions = await repository.findByGiftId(giftId);

      // Assert
      expect(contributions).toHaveLength(2);
      expect(contributions.map((c) => c.guestName)).toContain('Contributor 1');
      expect(contributions.map((c) => c.guestName)).toContain('Contributor 2');
    });

    it('should return empty array for gift with no contributions', async () => {
      // Arrange
      const giftId = UniqueId.create();

      // Act
      const contributions = await repository.findByGiftId(giftId);

      // Assert
      expect(contributions).toEqual([]);
    });
  });

  describe('findByPaymentProviderId', () => {
    it('should find contribution by payment provider ID', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Paying Guest',
        guestEmail: Email.create('payer@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
        paymentProvider: PaymentProvider.MERCADOPAGO,
      });
      contribution.markAsPaid('mp-payment-123');
      await repository.save(contribution);

      // Act
      const found = await repository.findByPaymentProviderId('mp-payment-123');

      // Assert
      expect(found).toBeDefined();
      expect(found?.paymentProviderId).toBe('mp-payment-123');
      expect(found?.guestName).toBe('Paying Guest');
    });

    it('should return null for non-existent payment provider ID', async () => {
      // Act
      const found = await repository.findByPaymentProviderId('non-existent-id');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('status transitions', () => {
    it('should persist status changes', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(500, 'UYU'),
      });
      await repository.save(contribution);

      // Act - mark as paid
      contribution.markAsPaid();
      await repository.save(contribution);
      const foundPaid = await repository.findById(contribution.id);

      // Assert
      expect(foundPaid?.status).toBe(ContributionStatus.PAID);
      expect(foundPaid?.isPaid()).toBe(true);
    });

    it('should persist rejection status', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(500, 'UYU'),
      });
      await repository.save(contribution);

      // Act - reject
      contribution.reject();
      await repository.save(contribution);
      const foundRejected = await repository.findById(contribution.id);

      // Assert
      expect(foundRejected?.status).toBe(ContributionStatus.REJECTED);
    });
  });

  describe('persistence reconstruction', () => {
    it('should correctly reconstruct contribution with all fields', async () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Full Data Guest',
        guestEmail: Email.create('fulldata@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(2500, 'UYU'),
        paymentProvider: PaymentProvider.MERCADOPAGO,
      });
      contribution.markAsPaid('payment-xyz');
      await repository.save(contribution);

      // Act
      const found = await repository.findById(contribution.id);

      // Assert
      expect(found?.amount).toBeDefined();
      expect(found?.amount?.amount).toBe(2500);
      expect(found?.amount?.currency).toBe('UYU');
      expect(found?.paymentProvider).toBe(PaymentProvider.MERCADOPAGO);
      expect(found?.status).toBe(ContributionStatus.PAID);
    });
  });
});

