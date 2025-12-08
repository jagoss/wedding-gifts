import { Request, Response } from 'express';
import { ContributionController } from '../ContributionController';
import { CreateContributionUseCase } from '../../../../application/use-cases/contribution/CreateContributionUseCase';
import { GetWeddingContributionsUseCase } from '../../../../application/use-cases/contribution/GetWeddingContributionsUseCase';
import { ValidationError } from '../../../../domain/errors/DomainError';

describe('ContributionController', () => {
  let controller: ContributionController;
  let mockCreateUseCase: jest.Mocked<CreateContributionUseCase>;
  let mockGetWeddingContributionsUseCase: jest.Mocked<GetWeddingContributionsUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mock use cases
    mockCreateUseCase = { execute: jest.fn() } as any;
    mockGetWeddingContributionsUseCase = { execute: jest.fn() } as any;

    // Create controller
    controller = new ContributionController(
      mockCreateUseCase,
      mockGetWeddingContributionsUseCase
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
  });

  describe('createPublicContribution', () => {
    it('should create contribution with valid data', async () => {
      // Arrange
      const slug = 'john-jane-wedding';
      const contributionData = {
        giftId: 'gift-123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        type: 'CONTRIBUTION',
        paymentMethod: 'MERCADOPAGO',
        amount: 1000,
        currency: 'UYU',
      };
      const expectedResult = {
        contributionId: 'contrib-123',
        status: 'PENDING' as any,
        payment: {
          provider: 'MERCADOPAGO',
          preferenceId: 'pref-123',
          checkoutUrl: 'https://mercadopago.com',
        },
      };
      mockRequest.params = { slug };
      mockRequest.body = contributionData;
      mockCreateUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        weddingSlug: slug,
        ...contributionData,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should validate required giftId', async () => {
      // Arrange
      mockRequest.params = { slug: 'wedding-slug' };
      mockRequest.body = {
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        type: 'CONTRIBUTION',
        paymentMethod: 'MERCADOPAGO',
      };

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Gift ID is required',
          }),
        })
      );
    });

    it('should validate required guestName', async () => {
      // Arrange
      mockRequest.params = { slug: 'wedding-slug' };
      mockRequest.body = {
        giftId: 'gift-123',
        guestEmail: 'john@example.com',
        type: 'CONTRIBUTION',
        paymentMethod: 'MERCADOPAGO',
      };

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate required guestEmail', async () => {
      // Arrange
      mockRequest.params = { slug: 'wedding-slug' };
      mockRequest.body = {
        giftId: 'gift-123',
        guestName: 'John Doe',
        type: 'CONTRIBUTION',
        paymentMethod: 'MERCADOPAGO',
      };

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate required type', async () => {
      // Arrange
      mockRequest.params = { slug: 'wedding-slug' };
      mockRequest.body = {
        giftId: 'gift-123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        paymentMethod: 'MERCADOPAGO',
      };

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate required paymentMethod', async () => {
      // Arrange
      mockRequest.params = { slug: 'wedding-slug' };
      mockRequest.body = {
        giftId: 'gift-123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        type: 'CONTRIBUTION',
      };

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should reject empty guestName', async () => {
      // Arrange
      mockRequest.params = { slug: 'wedding-slug' };
      mockRequest.body = {
        giftId: 'gift-123',
        guestName: '   ',
        guestEmail: 'john@example.com',
        type: 'CONTRIBUTION',
        paymentMethod: 'MERCADOPAGO',
      };

      // Act
      await controller.createPublicContribution(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getWeddingContributions', () => {
    it('should get all contributions for a wedding', async () => {
      // Arrange
      const weddingId = 'wedding-123';
      const expectedContributions = [
        {
          id: 'contrib-1',
          weddingId: 'wedding-123',
          giftId: 'gift-123',
          guestName: 'Guest 1',
          guestEmail: 'guest1@example.com',
          type: 'CONTRIBUTION' as any,
          amount: 1000,
          currency: 'UYU',
          status: 'PENDING' as any,
          paymentProvider: null,
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'contrib-2',
          weddingId: 'wedding-123',
          giftId: 'gift-123',
          guestName: 'Guest 2',
          guestEmail: 'guest2@example.com',
          type: 'CONTRIBUTION' as any,
          amount: 1500,
          currency: 'UYU',
          status: 'PENDING' as any,
          paymentProvider: null,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];
      mockRequest.params = { weddingId };
      mockGetWeddingContributionsUseCase.execute.mockResolvedValue(
        expectedContributions
      );

      // Act
      await controller.getWeddingContributions(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockGetWeddingContributionsUseCase.execute).toHaveBeenCalledWith(
        weddingId
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedContributions);
    });
  });
});

