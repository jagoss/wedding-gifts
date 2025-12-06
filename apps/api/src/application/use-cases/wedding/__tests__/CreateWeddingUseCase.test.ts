import { CreateWeddingUseCase } from '../CreateWeddingUseCase';
import { MockWeddingRepository } from '../../../../test-utils/MockRepositories';
import { TestDataFactory } from '../../../../test-utils/TestDataFactory';
import { ConflictError, ValidationError, EntityNotFoundError } from '../../../../domain/errors/DomainError';
import { BankAccountType } from '../../../../domain/entities/Wedding';

describe('CreateWeddingUseCase', () => {
  let useCase: CreateWeddingUseCase;
  let weddingRepository: MockWeddingRepository;

  beforeEach(() => {
    weddingRepository = new MockWeddingRepository();
    useCase = new CreateWeddingUseCase(weddingRepository);
  });

  describe('Happy Path', () => {
    it('should create a wedding with all fields', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: 'Juan and Ana Wedding',
        slug: 'juan-ana-2026',
        date: '2026-06-15',
        location: 'Buenos Aires',
        message: 'Join us for our special day',
        heroImageUrl: 'https://example.com/hero.jpg',
        bankAccounts: [
          {
            id: 'acc_1',
            type: BankAccountType.MERCADOPAGO,
            label: 'MercadoPago Account',
            details: { alias: 'juan.ana' },
          },
        ],
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Juan and Ana Wedding');
      expect(result.slug).toBe('juan-ana-2026');
      expect(result.location).toBe('Buenos Aires');
    });

    it('should create a wedding with minimal fields', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: 'Simple Wedding',
        slug: 'simple-wedding',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe('Simple Wedding');
      expect(result.slug).toBe('simple-wedding');
      expect(result.date).toBeNull();
      expect(result.location).toBeNull();
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError when title is empty', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: '',
        slug: 'valid-slug',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when slug is empty', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: 'Valid Title',
        slug: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid slug format', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: 'Valid Title',
        slug: 'Invalid Slug With Spaces!',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('Conflict Errors', () => {
    it('should throw ConflictError when slug already exists', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const existingWedding = TestDataFactory.createWedding({
        slug: 'duplicate-slug',
      });
      await weddingRepository.save(existingWedding);

      const input = {
        userId: userId.value,
        title: 'New Wedding',
        slug: 'duplicate-slug',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ConflictError);
    });
  });

  describe('Edge Cases', () => {
    it('should trim whitespace from title', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: '  Wedding with spaces  ',
        slug: 'valid-slug',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.title).toBe('Wedding with spaces');
    });

    it('should handle wedding with empty bank accounts array', async () => {
      // Arrange
      const userId = TestDataFactory.createId();
      const input = {
        userId: userId.value,
        title: 'Wedding',
        slug: 'wedding-slug',
        bankAccounts: [],
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.bankAccounts).toEqual([]);
    });
  });
});

