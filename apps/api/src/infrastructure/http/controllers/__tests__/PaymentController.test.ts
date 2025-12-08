import { Request, Response } from 'express';
import { PaymentController } from '../PaymentController';
import { CreatePaymentPreferenceUseCase } from '../../../../application/use-cases/payment/CreatePaymentPreferenceUseCase';
import { HandlePaymentWebhookUseCase } from '../../../../application/use-cases/payment/HandlePaymentWebhookUseCase';
import { ValidationError } from '../../../../domain/errors/DomainError';

describe('PaymentController', () => {
  let controller: PaymentController;
  let mockCreatePreferenceUseCase: jest.Mocked<CreatePaymentPreferenceUseCase>;
  let mockHandleWebhookUseCase: jest.Mocked<HandlePaymentWebhookUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create mock use cases
    mockCreatePreferenceUseCase = { execute: jest.fn() } as any;
    mockHandleWebhookUseCase = { execute: jest.fn() } as any;

    // Create controller
    controller = new PaymentController(
      mockCreatePreferenceUseCase,
      mockHandleWebhookUseCase
    );

    // Create mock request and response
    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('createPreference', () => {
    it('should create payment preference with valid data', async () => {
      // Arrange
      const preferenceData = {
        weddingId: 'wedding-123',
        contributionId: 'contrib-456',
      };
      const expectedResult = {
        preferenceId: 'pref-123',
        checkoutUrl: 'https://mercadopago.com/checkout/pref-123',
      };
      mockRequest.body = preferenceData;
      mockCreatePreferenceUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.createPreference(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockCreatePreferenceUseCase.execute).toHaveBeenCalledWith(
        preferenceData
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should validate required weddingId', async () => {
      // Arrange
      mockRequest.body = {
        contributionId: 'contrib-456',
      };

      // Act
      await controller.createPreference(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Wedding ID is required',
          }),
        })
      );
    });

    it('should validate required contributionId', async () => {
      // Arrange
      mockRequest.body = {
        weddingId: 'wedding-123',
      };

      // Act
      await controller.createPreference(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Contribution ID is required',
          }),
        })
      );
    });

    it('should handle use case errors', async () => {
      // Arrange
      mockRequest.body = {
        weddingId: 'wedding-123',
        contributionId: 'contrib-456',
      };
      mockCreatePreferenceUseCase.execute.mockRejectedValue(
        new ValidationError('Contribution not found')
      );

      // Act
      await controller.createPreference(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('handleWebhook', () => {
    it('should handle webhook with valid data', async () => {
      // Arrange
      const webhookData = {
        action: 'payment.updated',
        data: {
          id: 'payment-123',
        },
      };
      mockRequest.body = webhookData;
      mockHandleWebhookUseCase.execute.mockResolvedValue(undefined);

      // Act
      await controller.handleWebhook(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockHandleWebhookUseCase.execute).toHaveBeenCalledWith(webhookData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      mockRequest.body = { invalid: 'data' };
      const validationError = new ValidationError('Invalid webhook data');
      validationError.name = 'ValidationError';
      mockHandleWebhookUseCase.execute.mockRejectedValue(validationError);

      // Act
      await controller.handleWebhook(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 for non-validation errors to prevent retries', async () => {
      // Arrange
      mockRequest.body = { action: 'payment.updated', data: { id: 'pay-123' } };
      const otherError = new Error('Database connection failed');
      mockHandleWebhookUseCase.execute.mockRejectedValue(otherError);

      // Act
      await controller.handleWebhook(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should log non-validation errors', async () => {
      // Arrange
      mockRequest.body = { action: 'payment.updated' };
      const error = new Error('Unexpected error');
      mockHandleWebhookUseCase.execute.mockRejectedValue(error);

      // Act
      await controller.handleWebhook(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Webhook]'),
        error
      );
    });
  });
});

