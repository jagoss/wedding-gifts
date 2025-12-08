import { InMemoryWeddingRepository } from '../InMemoryWeddingRepository';
import { Wedding } from '../../../domain/entities/Wedding';
import { UniqueId, Slug } from '../../../domain/value-objects';

describe('InMemoryWeddingRepository', () => {
  let repository: InMemoryWeddingRepository;

  beforeEach(() => {
    repository = new InMemoryWeddingRepository();
  });

  describe('save', () => {
    it('should save and return wedding', async () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding = Wedding.create({
        userId,
        title: 'John & Jane Wedding',
        slug: Slug.create('john-jane-wedding'),
      });

      // Act
      const saved = await repository.save(wedding);

      // Assert
      expect(saved).toBe(wedding);
    });

    it('should update existing wedding when saved again', async () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding = Wedding.create({
        userId,
        title: 'Original Title',
        slug: Slug.create('original-title'),
      });
      await repository.save(wedding);

      // Act - update and save again
      wedding.update(userId, { title: 'Updated Title' });
      await repository.save(wedding);
      const found = await repository.findById(wedding.id);

      // Assert
      expect(found?.title).toBe('Updated Title');
    });
  });

  describe('findById', () => {
    it('should find saved wedding by ID', async () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding = Wedding.create({
        userId,
        title: 'Test Wedding',
        slug: Slug.create('test-wedding'),
      });
      await repository.save(wedding);

      // Act
      const found = await repository.findById(wedding.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id.value).toBe(wedding.id.value);
      expect(found?.title).toBe('Test Wedding');
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

  describe('findBySlug', () => {
    it('should find wedding by slug', async () => {
      // Arrange
      const userId = UniqueId.create();
      const slug = Slug.create('unique-wedding');
      const wedding = Wedding.create({
        userId,
        title: 'Unique Wedding',
        slug,
      });
      await repository.save(wedding);

      // Act
      const found = await repository.findBySlug(slug);

      // Assert
      expect(found).toBeDefined();
      expect(found?.slug.value).toBe('unique-wedding');
      expect(found?.title).toBe('Unique Wedding');
    });

    it('should return null for non-existent slug', async () => {
      // Arrange
      const slug = Slug.create('non-existent-wedding');

      // Act
      const found = await repository.findBySlug(slug);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all weddings for a user', async () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding1 = Wedding.create({
        userId,
        title: 'Wedding 1',
        slug: Slug.create('wedding-1'),
      });
      const wedding2 = Wedding.create({
        userId,
        title: 'Wedding 2',
        slug: Slug.create('wedding-2'),
      });
      await repository.save(wedding1);
      await repository.save(wedding2);

      // Act
      const weddings = await repository.findByUserId(userId);

      // Assert
      expect(weddings).toHaveLength(2);
      expect(weddings.map((w) => w.title)).toContain('Wedding 1');
      expect(weddings.map((w) => w.title)).toContain('Wedding 2');
    });

    it('should return empty array for user with no weddings', async () => {
      // Arrange
      const userId = UniqueId.create();

      // Act
      const weddings = await repository.findByUserId(userId);

      // Assert
      expect(weddings).toEqual([]);
    });

    it('should only return weddings for specific user', async () => {
      // Arrange
      const userId1 = UniqueId.create();
      const userId2 = UniqueId.create();
      const wedding1 = Wedding.create({
        userId: userId1,
        title: 'User 1 Wedding',
        slug: Slug.create('user-1-wedding'),
      });
      const wedding2 = Wedding.create({
        userId: userId2,
        title: 'User 2 Wedding',
        slug: Slug.create('user-2-wedding'),
      });
      await repository.save(wedding1);
      await repository.save(wedding2);

      // Act
      const user1Weddings = await repository.findByUserId(userId1);

      // Assert
      expect(user1Weddings).toHaveLength(1);
      expect(user1Weddings[0].title).toBe('User 1 Wedding');
    });
  });

  describe('existsBySlug', () => {
    it('should return true if slug exists', async () => {
      // Arrange
      const userId = UniqueId.create();
      const slug = Slug.create('existing-wedding');
      const wedding = Wedding.create({
        userId,
        title: 'Existing Wedding',
        slug,
      });
      await repository.save(wedding);

      // Act
      const exists = await repository.existsBySlug(slug);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if slug does not exist', async () => {
      // Arrange
      const slug = Slug.create('non-existent-slug');

      // Act
      const exists = await repository.existsBySlug(slug);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete wedding by ID', async () => {
      // Arrange
      const userId = UniqueId.create();
      const wedding = Wedding.create({
        userId,
        title: 'To Be Deleted',
        slug: Slug.create('to-be-deleted'),
      });
      await repository.save(wedding);

      // Act
      await repository.delete(wedding.id);
      const found = await repository.findById(wedding.id);

      // Assert
      expect(found).toBeNull();
    });

    it('should not throw when deleting non-existent wedding', async () => {
      // Arrange
      const id = UniqueId.create();

      // Act & Assert
      await expect(repository.delete(id)).resolves.not.toThrow();
    });
  });
});

