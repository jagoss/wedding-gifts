import { Request, Response } from 'express';
import { AuthController } from '../AuthController';
import { RegisterUserUseCase } from '../../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';
import { ValidationError } from '../../../../domain/errors/DomainError';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRegisterUseCase: jest.Mocked<RegisterUserUseCase>;
  let mockLoginUseCase: jest.Mocked<LoginUserUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mock use cases
    mockRegisterUseCase = {
      execute: jest.fn(),
    } as any;

    mockLoginUseCase = {
      execute: jest.fn(),
    } as any;

    // Create controller
    controller = new AuthController(mockRegisterUseCase, mockLoginUseCase);

    // Create mock request and response
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('register', () => {
    it('should register user with valid data', async () => {
      // Arrange
      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const expectedResult = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      };
      mockRequest.body = registerData;
      mockRegisterUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle validation errors', async () => {
      // Arrange
      mockRequest.body = { name: '', email: 'invalid', password: '123' };
      mockRegisterUseCase.execute.mockRejectedValue(
        new ValidationError('Invalid email format')
      );

      // Act
      await controller.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRegisterUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: expect.any(String),
          }),
        })
      );
    });

    it('should handle duplicate email errors', async () => {
      // Arrange
      mockRequest.body = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'password123',
      };
      mockRegisterUseCase.execute.mockRejectedValue(
        new ValidationError('Email already registered')
      );

      // Act
      await controller.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
      };
      const expectedResult = {
        accessToken: 'mock-token',
        user: { id: 'user-123', name: 'Test User', email: 'user@example.com' },
      };
      mockRequest.body = loginData;
      mockLoginUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      mockRequest.body = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };
      mockLoginUseCase.execute.mockRejectedValue(
        new ValidationError('Invalid credentials')
      );

      // Act
      await controller.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockLoginUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle non-existent user', async () => {
      // Arrange
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      mockLoginUseCase.execute.mockRejectedValue(
        new ValidationError('User not found')
      );

      // Act
      await controller.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});

