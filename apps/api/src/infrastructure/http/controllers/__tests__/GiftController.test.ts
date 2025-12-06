import { Request, Response } from 'express';
import { GiftController } from '../GiftController';
import { CreateGiftUseCase } from '../../../../application/use-cases/gift/CreateGiftUseCase';
import { GetGiftUseCase } from '../../../../application/use-cases/gift/GetGiftUseCase';
import { GetWeddingGiftsUseCase } from '../../../../application/use-cases/gift/GetWeddingGiftsUseCase';
import { UpdateGiftUseCase } from '../../../../application/use-cases/gift/UpdateGiftUseCase';
import { DeleteGiftUseCase } from '../../../../application/use-cases/gift/DeleteGiftUseCase';
import { GiftType, GiftStatus } from '../../../../domain/entities/Gift';

describe('GiftController', () => {
  let controller: GiftController;
  let mockCreateUseCase: jest.Mocked<CreateGiftUseCase>;
  let mockGetUseCase: jest.Mocked<GetGiftUseCase>;
  let mockGetWeddingGiftsUseCase: jest.Mocked<GetWeddingGiftsUseCase>;
  let mockUpdateUseCase: jest.Mocked<UpdateGiftUseCase>;
  let mockDeleteUseCase: jest.Mocked<DeleteGiftUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mock use cases
    mockCreateUseCase = { execute: jest.fn() } as any;
    mockGetUseCase = { execute: jest.fn() } as any;
    mockGetWeddingGiftsUseCase = { execute: jest.fn() } as any;
    mockUpdateUseCase = { execute: jest.fn() } as any;
    mockDeleteUseCase = { execute: jest.fn() } as any;

    // Create controller
    controller = new GiftController(
      mockCreateUseCase,
      mockGetUseCase,
      mockGetWeddingGiftsUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase
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

  describe('getWeddingGifts', () => {
    it('should get all gifts for a wedding', async () => {
      // Arrange
      const weddingId = 'wedding-123';
      const expectedGifts = [
        {
          id: 'gift-1',
          weddingId: 'wedding-123',
          title: 'Coffee Maker',
          description: null,
          estimatedPrice: null,
          currency: null,
          imageUrl: null,
          productUrl: null,
          type: GiftType.PRODUCT,
          status: GiftStatus.AVAILABLE,
          maxContributions: null,
        },
        {
          id: 'gift-2',
          weddingId: 'wedding-123',
          title: 'Blender',
          description: null,
          estimatedPrice: null,
          currency: null,
          imageUrl: null,
          productUrl: null,
          type: GiftType.PRODUCT,
          status: GiftStatus.AVAILABLE,
          maxContributions: null,
        },
      ];
      mockRequest.params = { weddingId };
      mockGetWeddingGiftsUseCase.execute.mockResolvedValue(expectedGifts);

      // Act
      await controller.getWeddingGifts(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockGetWeddingGiftsUseCase.execute).toHaveBeenCalledWith(weddingId);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedGifts);
    });
  });

  describe('createGift', () => {
    it('should create gift for wedding', async () => {
      // Arrange
      const weddingId = 'wedding-123';
      const giftData = {
        title: 'Coffee Maker',
        type: 'PRODUCT',
        estimatedPrice: 1500,
        currency: 'UYU',
      };
      const expectedResult = {
        id: 'gift-123',
        weddingId,
        title: 'Coffee Maker',
        type: GiftType.PRODUCT,
        estimatedPrice: 1500,
        currency: 'UYU',
        description: null,
        imageUrl: null,
        productUrl: null,
        status: GiftStatus.AVAILABLE,
        maxContributions: null,
      };
      mockRequest.params = { weddingId };
      mockRequest.body = giftData;
      mockCreateUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.createGift(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        weddingId,
        ...giftData,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('getGift', () => {
    it('should get gift by ID', async () => {
      // Arrange
      const giftId = 'gift-123';
      const expectedGift = {
        id: giftId,
        weddingId: 'wedding-123',
        title: 'Coffee Maker',
        description: null,
        estimatedPrice: null,
        currency: null,
        imageUrl: null,
        productUrl: null,
        type: 'PRODUCT' as any,
        status: 'AVAILABLE' as any,
        maxContributions: null,
      };
      mockRequest.params = { giftId };
      mockGetUseCase.execute.mockResolvedValue(expectedGift);

      // Act
      await controller.getGift(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetUseCase.execute).toHaveBeenCalledWith(giftId);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedGift);
    });
  });

  describe('updateGift', () => {
    it('should update gift', async () => {
      // Arrange
      const giftId = 'gift-123';
      const updateData = {
        title: 'Updated Gift',
        description: 'New description',
      };
      const expectedResult = {
        id: giftId,
        weddingId: 'wedding-123',
        estimatedPrice: null,
        currency: null,
        imageUrl: null,
        productUrl: null,
        type: 'PRODUCT' as any,
        status: 'AVAILABLE' as any,
        maxContributions: null,
        ...updateData,
      };
      mockRequest.params = { giftId };
      mockRequest.body = updateData;
      mockUpdateUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.updateGift(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        giftId,
        ...updateData,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('deleteGift', () => {
    it('should delete gift', async () => {
      // Arrange
      const giftId = 'gift-123';
      mockRequest.params = { giftId };
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      // Act
      await controller.deleteGift(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(giftId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});

