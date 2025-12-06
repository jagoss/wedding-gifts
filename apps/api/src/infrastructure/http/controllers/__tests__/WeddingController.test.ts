import { Request, Response } from 'express';
import { WeddingController } from '../WeddingController';
import { CreateWeddingUseCase } from '../../../../application/use-cases/wedding/CreateWeddingUseCase';
import { GetWeddingUseCase } from '../../../../application/use-cases/wedding/GetWeddingUseCase';
import { GetWeddingBySlugUseCase } from '../../../../application/use-cases/wedding/GetWeddingBySlugUseCase';
import { GetUserWeddingsUseCase } from '../../../../application/use-cases/wedding/GetUserWeddingsUseCase';
import { UpdateWeddingUseCase } from '../../../../application/use-cases/wedding/UpdateWeddingUseCase';
import { DeleteWeddingUseCase } from '../../../../application/use-cases/wedding/DeleteWeddingUseCase';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

describe('WeddingController', () => {
  let controller: WeddingController;
  let mockCreateUseCase: jest.Mocked<CreateWeddingUseCase>;
  let mockGetUseCase: jest.Mocked<GetWeddingUseCase>;
  let mockGetBySlugUseCase: jest.Mocked<GetWeddingBySlugUseCase>;
  let mockGetUserWeddingsUseCase: jest.Mocked<GetUserWeddingsUseCase>;
  let mockUpdateUseCase: jest.Mocked<UpdateWeddingUseCase>;
  let mockDeleteUseCase: jest.Mocked<DeleteWeddingUseCase>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mock use cases
    mockCreateUseCase = { execute: jest.fn() } as any;
    mockGetUseCase = { execute: jest.fn() } as any;
    mockGetBySlugUseCase = { execute: jest.fn() } as any;
    mockGetUserWeddingsUseCase = { execute: jest.fn() } as any;
    mockUpdateUseCase = { execute: jest.fn() } as any;
    mockDeleteUseCase = { execute: jest.fn() } as any;

    // Create controller
    controller = new WeddingController(
      mockCreateUseCase,
      mockGetUseCase,
      mockGetBySlugUseCase,
      mockGetUserWeddingsUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase
    );

    // Create mock request and response
    mockRequest = {
      body: {},
      params: {},
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('createWedding', () => {
    it('should create wedding with authenticated user', async () => {
      // Arrange
      const weddingData = {
        title: 'John & Jane Wedding',
        date: '2025-06-15',
        location: 'Beach Resort',
      };
      const expectedResult = {
        id: 'wedding-123',
        userId: 'user-123',
        slug: 'john-jane-wedding',
        message: null,
        heroImageUrl: null,
        bankAccounts: [],
        ...weddingData,
      };
      mockRequest.body = weddingData;
      mockCreateUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.createWedding(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        ...weddingData,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('getUserWeddings', () => {
    it('should get all weddings for authenticated user', async () => {
      // Arrange
      const expectedWeddings = [
        { id: 'wedding-1', title: 'Wedding 1', slug: 'wedding-1', date: null, location: null },
        { id: 'wedding-2', title: 'Wedding 2', slug: 'wedding-2', date: null, location: null },
      ];
      mockGetUserWeddingsUseCase.execute.mockResolvedValue(expectedWeddings);

      // Act
      await controller.getUserWeddings(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockGetUserWeddingsUseCase.execute).toHaveBeenCalledWith('user-123');
      expect(mockResponse.json).toHaveBeenCalledWith(expectedWeddings);
    });
  });

  describe('getWedding', () => {
    it('should get wedding by ID', async () => {
      // Arrange
      const weddingId = 'wedding-123';
      const expectedWedding = {
        id: weddingId,
        title: 'Test Wedding',
        userId: 'user-123',
        slug: 'test-wedding',
        date: null,
        location: null,
        message: null,
        heroImageUrl: null,
        bankAccounts: [],
      };
      mockRequest.params = { weddingId };
      mockGetUseCase.execute.mockResolvedValue(expectedWedding);

      // Act
      await controller.getWedding(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetUseCase.execute).toHaveBeenCalledWith(weddingId);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedWedding);
    });
  });

  describe('getPublicWedding', () => {
    it('should get wedding by slug', async () => {
      // Arrange
      const slug = 'john-jane-wedding';
      const expectedWedding = {
        wedding: {
          id: 'wedding-123',
          slug,
          title: 'John & Jane',
          date: null,
          location: null,
          message: null,
          heroImageUrl: null,
        },
        gifts: [],
      };
      mockRequest.params = { slug };
      mockGetBySlugUseCase.execute.mockResolvedValue(expectedWedding);

      // Act
      await controller.getPublicWedding(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockGetBySlugUseCase.execute).toHaveBeenCalledWith(slug);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedWedding);
    });
  });

  describe('updateWedding', () => {
    it('should update wedding with authenticated user', async () => {
      // Arrange
      const weddingId = 'wedding-123';
      const updateData = { title: 'Updated Title', location: 'New Location' };
      const expectedResult = {
        id: weddingId,
        userId: 'user-123',
        slug: 'updated-slug',
        date: null,
        message: null,
        heroImageUrl: null,
        bankAccounts: [],
        ...updateData,
      };
      mockRequest.params = { weddingId };
      mockRequest.body = updateData;
      mockUpdateUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.updateWedding(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        weddingId,
        userId: 'user-123',
        ...updateData,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('deleteWedding', () => {
    it('should delete wedding with authenticated user', async () => {
      // Arrange
      const weddingId = 'wedding-123';
      mockRequest.params = { weddingId };
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      // Act
      await controller.deleteWedding(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      // Assert
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({
        weddingId,
        userId: 'user-123',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});

