import { ConsoleEmailService } from '../ConsoleEmailService';

describe('ConsoleEmailService', () => {
  let service: ConsoleEmailService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ConsoleEmailService();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('sendWelcomeEmail', () => {
    it('should log welcome email message', async () => {
      // Arrange
      const email = 'user@example.com';
      const name = 'John Doe';

      // Act
      await service.sendWelcomeEmail(email, name);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Email]')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Welcome')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(name)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(email)
      );
    });

    it('should handle different user names', async () => {
      // Arrange
      const email = 'jane@example.com';
      const name = 'Jane Smith';

      // Act
      await service.sendWelcomeEmail(email, name);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Jane Smith')
      );
    });
  });

  describe('sendContributionCreated', () => {
    it('should log contribution created message', async () => {
      // Arrange
      const email = 'guest@example.com';
      const guestName = 'Guest Name';
      const giftTitle = 'Coffee Maker';

      // Act
      await service.sendContributionCreated(email, guestName, giftTitle);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Email]')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Contribution created')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(guestName)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(email)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(giftTitle)
      );
    });

    it('should handle different gift titles', async () => {
      // Arrange
      const giftTitle = 'Honeymoon Fund';

      // Act
      await service.sendContributionCreated(
        'test@example.com',
        'Test User',
        giftTitle
      );

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Honeymoon Fund')
      );
    });
  });

  describe('sendContributionPaid', () => {
    it('should log payment confirmation message', async () => {
      // Arrange
      const email = 'payer@example.com';
      const guestName = 'Paying Guest';
      const amount = 1500;

      // Act
      await service.sendContributionPaid(email, guestName, amount);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Email]')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Payment confirmation')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(guestName)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(email)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(amount.toString())
      );
    });

    it('should handle different amounts', async () => {
      // Arrange
      const amount = 5000;

      // Act
      await service.sendContributionPaid(
        'test@example.com',
        'Test User',
        amount
      );

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('5000')
      );
    });
  });

  describe('all methods', () => {
    it('should be async and return promises', async () => {
      // Act & Assert
      await expect(
        service.sendWelcomeEmail('test@example.com', 'Test')
      ).resolves.toBeUndefined();

      await expect(
        service.sendContributionCreated('test@example.com', 'Test', 'Gift')
      ).resolves.toBeUndefined();

      await expect(
        service.sendContributionPaid('test@example.com', 'Test', 100)
      ).resolves.toBeUndefined();
    });
  });
});

