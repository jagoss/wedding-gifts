import { MockPaymentGateway } from '../MockPaymentGateway';

describe('MockPaymentGateway', () => {
  let gateway: MockPaymentGateway;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    gateway = new MockPaymentGateway();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('createPreference', () => {
    it('should create payment preference with valid data', async () => {
      // Arrange
      const params = {
        contributionId: 'contrib-123',
        weddingId: 'wedding-456',
        amount: 1500,
        currency: 'UYU',
        description: 'Contribution for Coffee Maker',
        payerEmail: 'payer@example.com',
        payerName: 'John Doe',
      };

      // Act
      const result = await gateway.createPreference(params);

      // Assert
      expect(result).toBeDefined();
      expect(result.preferenceId).toBeDefined();
      expect(result.checkoutUrl).toBeDefined();
      expect(typeof result.preferenceId).toBe('string');
      expect(typeof result.checkoutUrl).toBe('string');
    });

    it('should generate preference ID based on contribution ID', async () => {
      // Arrange
      const contributionId = 'contrib-xyz-789';
      const params = {
        contributionId,
        weddingId: 'wedding-123',
        amount: 2000,
        currency: 'UYU',
        description: 'Test contribution',
        payerEmail: 'test@example.com',
        payerName: 'Test User',
      };

      // Act
      const result = await gateway.createPreference(params);

      // Assert
      expect(result.preferenceId).toContain(contributionId);
      expect(result.preferenceId).toBe(`pref_${contributionId}`);
    });

    it('should generate checkout URL with preference ID', async () => {
      // Arrange
      const params = {
        contributionId: 'contrib-abc',
        weddingId: 'wedding-123',
        amount: 500,
        currency: 'UYU',
        description: 'Test payment',
        payerEmail: 'test@example.com',
        payerName: 'Test',
      };

      // Act
      const result = await gateway.createPreference(params);

      // Assert
      expect(result.checkoutUrl).toContain(result.preferenceId);
      expect(result.checkoutUrl).toContain('mercadopago.com');
    });

    it('should log preference creation', async () => {
      // Arrange
      const params = {
        contributionId: 'contrib-123',
        weddingId: 'wedding-456',
        amount: 1000,
        currency: 'UYU',
        description: 'Test',
        payerEmail: 'test@example.com',
        payerName: 'Test User',
      };

      // Act
      await gateway.createPreference(params);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PaymentGateway]'),
        expect.any(Object)
      );
    });
  });

  describe('getPaymentDetails', () => {
    it('should return null for non-existent payment', async () => {
      // Act
      const result = await gateway.getPaymentDetails('non-existent-payment');

      // Assert
      expect(result).toBeNull();
    });

    it('should return payment details after simulation', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const contributionId = 'contrib-456';
      gateway.simulatePayment(paymentId, contributionId, 'approved', 1500, 'UYU');

      // Act
      const result = await gateway.getPaymentDetails(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.paymentId).toBe(paymentId);
      expect(result?.status).toBe('approved');
      expect(result?.externalReference).toBe(contributionId);
      expect(result?.amount).toBe(1500);
      expect(result?.currency).toBe('UYU');
    });
  });

  describe('simulatePayment', () => {
    it('should simulate approved payment', async () => {
      // Arrange
      const paymentId = 'payment-approved';
      const contributionId = 'contrib-123';

      // Act
      gateway.simulatePayment(paymentId, contributionId, 'approved');
      const details = await gateway.getPaymentDetails(paymentId);

      // Assert
      expect(details?.status).toBe('approved');
      expect(details?.externalReference).toBe(contributionId);
    });

    it('should simulate pending payment', async () => {
      // Arrange
      const paymentId = 'payment-pending';
      const contributionId = 'contrib-456';

      // Act
      gateway.simulatePayment(paymentId, contributionId, 'pending');
      const details = await gateway.getPaymentDetails(paymentId);

      // Assert
      expect(details?.status).toBe('pending');
    });

    it('should simulate rejected payment', async () => {
      // Arrange
      const paymentId = 'payment-rejected';
      const contributionId = 'contrib-789';

      // Act
      gateway.simulatePayment(paymentId, contributionId, 'rejected');
      const details = await gateway.getPaymentDetails(paymentId);

      // Assert
      expect(details?.status).toBe('rejected');
    });

    it('should use custom amount and currency', async () => {
      // Arrange
      const paymentId = 'payment-custom';
      const contributionId = 'contrib-custom';
      const amount = 5000;
      const currency = 'USD';

      // Act
      gateway.simulatePayment(paymentId, contributionId, 'approved', amount, currency);
      const details = await gateway.getPaymentDetails(paymentId);

      // Assert
      expect(details?.amount).toBe(amount);
      expect(details?.currency).toBe(currency);
    });

    it('should use default amount and currency when not provided', async () => {
      // Arrange
      const paymentId = 'payment-default';
      const contributionId = 'contrib-default';

      // Act
      gateway.simulatePayment(paymentId, contributionId, 'approved');
      const details = await gateway.getPaymentDetails(paymentId);

      // Assert
      expect(details?.amount).toBe(100);
      expect(details?.currency).toBe('UYU');
    });
  });
});

