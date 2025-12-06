import { User } from '../domain/entities/User';
import { Wedding } from '../domain/entities/Wedding';
import { Gift, GiftType, GiftStatus } from '../domain/entities/Gift';
import { Contribution, ContributionType, ContributionStatus, PaymentProvider } from '../domain/entities/Contribution';
import { UniqueId, Email, Slug, Money } from '../domain/value-objects';

/**
 * Test data factories for creating test entities with sensible defaults.
 * Makes tests more readable and maintainable.
 */

export class TestDataFactory {
  /**
   * Creates a test User entity.
   */
  static createUser(overrides?: Partial<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  }>): User {
    const defaults = {
      id: `user_${Date.now()}`,
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      passwordHash: 'hashed_password_123',
    };

    const data = { ...defaults, ...overrides };

    return User.fromPersistence({
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
    });
  }

  /**
   * Creates a test Wedding entity.
   */
  static createWedding(overrides?: Partial<{
    id: string;
    userId: string;
    title: string;
    slug: string;
    date: Date | null;
    location: string | null;
    message: string | null;
    heroImageUrl: string | null;
    bankAccounts: any[];
  }>): Wedding {
    const defaults = {
      id: `wed_${Date.now()}`,
      userId: `user_${Date.now()}`,
      title: 'Test Wedding',
      slug: `test-wedding-${Date.now()}`,
      date: null,
      location: null,
      message: null,
      heroImageUrl: null,
      bankAccounts: [],
    };

    const data = { ...defaults, ...overrides };

    return Wedding.fromPersistence({
      id: data.id,
      userId: data.userId,
      title: data.title,
      slug: data.slug,
      date: data.date?.toISOString() || null,
      location: data.location,
      message: data.message,
      heroImageUrl: data.heroImageUrl,
      bankAccounts: data.bankAccounts,
    });
  }

  /**
   * Creates a test Gift entity.
   */
  static createGift(overrides?: Partial<{
    id: string;
    weddingId: string;
    title: string;
    description: string | null;
    estimatedPrice: number | null;
    currency: string | null;
    imageUrl: string | null;
    productUrl: string | null;
    type: GiftType;
    status: GiftStatus;
    maxContributions: number | null;
  }>): Gift {
    const defaults = {
      id: `gift_${Date.now()}`,
      weddingId: `wed_${Date.now()}`,
      title: 'Test Gift',
      description: 'A wonderful test gift',
      estimatedPrice: 10000,
      currency: 'USD',
      imageUrl: null,
      productUrl: null,
      type: GiftType.PRODUCT,
      status: GiftStatus.AVAILABLE,
      maxContributions: null,
    };

    const data = { ...defaults, ...overrides };

    return Gift.fromPersistence({
      id: data.id,
      weddingId: data.weddingId,
      title: data.title,
      description: data.description,
      estimatedPrice: data.estimatedPrice,
      currency: data.currency,
      imageUrl: data.imageUrl,
      productUrl: data.productUrl,
      type: data.type,
      status: data.status,
      maxContributions: data.maxContributions,
    });
  }

  /**
   * Creates a test Contribution entity.
   */
  static createContribution(overrides?: Partial<{
    id: string;
    weddingId: string;
    giftId: string;
    guestName: string;
    guestEmail: string;
    type: ContributionType;
    amount: number | null;
    currency: string | null;
    paymentProvider: PaymentProvider | null;
  }>): Contribution {
    const defaults = {
      id: `contrib_${Date.now()}`,
      weddingId: `wed_${Date.now()}`,
      giftId: `gift_${Date.now()}`,
      guestName: 'Test Guest',
      guestEmail: `guest${Date.now()}@example.com`,
      type: ContributionType.CONTRIBUTION,
      amount: 5000,
      currency: 'USD',
      paymentProvider: PaymentProvider.MERCADOPAGO,
    };

    const data = { ...defaults, ...overrides };

    return Contribution.fromPersistence({
      id: data.id,
      weddingId: data.weddingId,
      giftId: data.giftId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      status: ContributionStatus.PENDING,
      paymentProvider: data.paymentProvider,
      paymentProviderId: null,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Creates a test UniqueId.
   */
  static createId(value?: string): UniqueId {
    return value ? UniqueId.fromString(value) : UniqueId.create();
  }

  /**
   * Creates a test Email.
   */
  static createEmail(value?: string): Email {
    return Email.create(value || `test${Date.now()}@example.com`);
  }

  /**
   * Creates a test Slug.
   */
  static createSlug(value?: string): Slug {
    return Slug.create(value || `test-slug-${Date.now()}`);
  }

  /**
   * Creates a test Money value object.
   */
  static createMoney(amount?: number, currency?: string): Money {
    return Money.create(amount || 100, currency || 'USD');
  }
}

