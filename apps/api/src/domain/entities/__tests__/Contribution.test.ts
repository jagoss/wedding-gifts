import {
  Contribution,
  ContributionType,
  ContributionStatus,
  PaymentProvider,
} from '../Contribution';
import { UniqueId, Money, Email } from '../../value-objects';
import { ValidationError } from '../../errors/DomainError';

describe('Contribution', () => {
  describe('Happy Path - Creation', () => {
    it('should create a contribution with valid data', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');
      const amount = Money.create(1000, 'UYU');

      // Act
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'John Doe',
        guestEmail,
        type: ContributionType.CONTRIBUTION,
        amount,
        paymentProvider: PaymentProvider.MERCADOPAGO,
      });

      // Assert
      expect(contribution.id).toBeDefined();
      expect(contribution.weddingId).toBe(weddingId);
      expect(contribution.giftId).toBe(giftId);
      expect(contribution.guestName).toBe('John Doe');
      expect(contribution.guestEmail.value).toBe('guest@example.com');
      expect(contribution.type).toBe(ContributionType.CONTRIBUTION);
      expect(contribution.amount?.amount).toBe(1000);
      expect(contribution.status).toBe(ContributionStatus.PENDING);
    });

    it('should create a reservation without amount', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');

      // Act
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Jane Smith',
        guestEmail,
        type: ContributionType.RESERVATION,
      });

      // Assert
      expect(contribution.type).toBe(ContributionType.RESERVATION);
      expect(contribution.amount).toBeNull();
      expect(contribution.status).toBe(ContributionStatus.PENDING);
    });

    it('should trim guest name whitespace', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');

      // Act
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: '  John Doe  ',
        guestEmail,
        type: ContributionType.RESERVATION,
      });

      // Assert
      expect(contribution.guestName).toBe('John Doe');
    });

    it('should generate unique IDs', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');
      const amount = Money.create(500, 'UYU');

      // Act
      const contribution1 = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Guest 1',
        guestEmail,
        type: ContributionType.CONTRIBUTION,
        amount,
      });
      const contribution2 = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Guest 2',
        guestEmail,
        type: ContributionType.CONTRIBUTION,
        amount,
      });

      // Assert
      expect(contribution1.id.value).not.toBe(contribution2.id.value);
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for empty guest name', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');

      // Act & Assert
      expect(() =>
        Contribution.create({
          weddingId,
          giftId,
          guestName: '',
          guestEmail,
          type: ContributionType.RESERVATION,
        })
      ).toThrow(ValidationError);
      expect(() =>
        Contribution.create({
          weddingId,
          giftId,
          guestName: '',
          guestEmail,
          type: ContributionType.RESERVATION,
        })
      ).toThrow('Guest name is required');
    });

    it('should throw ValidationError for whitespace-only guest name', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');

      // Act & Assert
      expect(() =>
        Contribution.create({
          weddingId,
          giftId,
          guestName: '   ',
          guestEmail,
          type: ContributionType.RESERVATION,
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for contribution without amount', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const guestEmail = Email.create('guest@example.com');

      // Act & Assert
      expect(() =>
        Contribution.create({
          weddingId,
          giftId,
          guestName: 'John Doe',
          guestEmail,
          type: ContributionType.CONTRIBUTION,
        })
      ).toThrow(ValidationError);
      expect(() =>
        Contribution.create({
          weddingId,
          giftId,
          guestName: 'John Doe',
          guestEmail,
          type: ContributionType.CONTRIBUTION,
        })
      ).toThrow('Amount is required for contributions');
    });
  });

  describe('Status Transitions', () => {
    it('should mark contribution as paid', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.markAsPaid('payment-123');

      // Assert
      expect(contribution.status).toBe(ContributionStatus.PAID);
      expect(contribution.isPaid()).toBe(true);
      expect(contribution.paymentProviderId).toBe('payment-123');
    });

    it('should mark as paid without payment provider ID', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.markAsPaid();

      // Assert
      expect(contribution.status).toBe(ContributionStatus.PAID);
      expect(contribution.isPaid()).toBe(true);
    });

    it('should be idempotent when marking as paid multiple times', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.markAsPaid('payment-first');
      contribution.markAsPaid('payment-second');

      // Assert
      expect(contribution.status).toBe(ContributionStatus.PAID);
      expect(contribution.paymentProviderId).toBe('payment-first');
    });

    it('should ignore reject when already paid', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.markAsPaid('payment-123');
      contribution.reject();

      // Assert
      expect(contribution.status).toBe(ContributionStatus.PAID);
      expect(contribution.paymentProviderId).toBe('payment-123');
    });

    it('should reject contribution', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.reject();

      // Assert
      expect(contribution.status).toBe(ContributionStatus.REJECTED);
      expect(contribution.isPaid()).toBe(false);
      expect(contribution.isPending()).toBe(false);
    });

    it('should be idempotent when rejecting multiple times', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.reject();
      contribution.reject();

      // Assert
      expect(contribution.status).toBe(ContributionStatus.REJECTED);
    });

    it('should set payment provider ID', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.setPaymentProviderId('external-payment-id');

      // Assert
      expect(contribution.paymentProviderId).toBe('external-payment-id');
    });
  });

  describe('Status Checks', () => {
    it('should correctly identify pending status', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Assert
      expect(contribution.isPending()).toBe(true);
      expect(contribution.isPaid()).toBe(false);
    });

    it('should correctly identify paid status', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'Test Guest',
        guestEmail: Email.create('test@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1000, 'UYU'),
      });

      // Act
      contribution.markAsPaid();

      // Assert
      expect(contribution.isPending()).toBe(false);
      expect(contribution.isPaid()).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should convert to persistence format', () => {
      // Arrange
      const weddingId = UniqueId.create();
      const giftId = UniqueId.create();
      const contribution = Contribution.create({
        weddingId,
        giftId,
        guestName: 'John Doe',
        guestEmail: Email.create('john@example.com'),
        type: ContributionType.CONTRIBUTION,
        amount: Money.create(1500, 'UYU'),
        paymentProvider: PaymentProvider.MERCADOPAGO,
      });

      // Act
      const data = contribution.toPersistence();

      // Assert
      expect(data).toEqual({
        id: contribution.id.value,
        weddingId: weddingId.value,
        giftId: giftId.value,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 1500,
        currency: 'UYU',
        status: ContributionStatus.PENDING,
        paymentProvider: PaymentProvider.MERCADOPAGO,
        paymentProviderId: null,
        createdAt: expect.any(String),
      });
    });

    it('should reconstruct from persistence', () => {
      // Arrange
      const data = {
        id: 'contrib-123',
        weddingId: 'wedding-456',
        giftId: 'gift-789',
        guestName: 'Jane Smith',
        guestEmail: 'jane@example.com',
        type: ContributionType.CONTRIBUTION,
        amount: 2000,
        currency: 'UYU',
        status: ContributionStatus.PAID,
        paymentProvider: PaymentProvider.MERCADOPAGO,
        paymentProviderId: 'payment-abc',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      // Act
      const contribution = Contribution.fromPersistence(data);

      // Assert
      expect(contribution.id.value).toBe('contrib-123');
      expect(contribution.weddingId.value).toBe('wedding-456');
      expect(contribution.giftId.value).toBe('gift-789');
      expect(contribution.guestName).toBe('Jane Smith');
      expect(contribution.guestEmail.value).toBe('jane@example.com');
      expect(contribution.type).toBe(ContributionType.CONTRIBUTION);
      expect(contribution.amount?.amount).toBe(2000);
      expect(contribution.amount?.currency).toBe('UYU');
      expect(contribution.status).toBe(ContributionStatus.PAID);
      expect(contribution.paymentProvider).toBe(PaymentProvider.MERCADOPAGO);
      expect(contribution.paymentProviderId).toBe('payment-abc');
    });

    it('should reconstruct reservation without amount', () => {
      // Arrange
      const data = {
        id: 'contrib-res-123',
        weddingId: 'wedding-456',
        giftId: 'gift-789',
        guestName: 'Reservation Guest',
        guestEmail: 'res@example.com',
        type: ContributionType.RESERVATION,
        amount: null,
        currency: null,
        status: ContributionStatus.PENDING,
        paymentProvider: null,
        paymentProviderId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      // Act
      const contribution = Contribution.fromPersistence(data);

      // Assert
      expect(contribution.type).toBe(ContributionType.RESERVATION);
      expect(contribution.amount).toBeNull();
      expect(contribution.paymentProvider).toBeNull();
    });
  });
});

