import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IWeddingRepository } from '../domain/repositories/IWeddingRepository';
import { IGiftRepository } from '../domain/repositories/IGiftRepository';
import { IContributionRepository } from '../domain/repositories/IContributionRepository';
import { IPasswordHasher } from '../domain/services/IPasswordHasher';
import { ITokenService } from '../domain/services/ITokenService';
import { IEmailService } from '../domain/services/IEmailService';
import { IPaymentGateway } from '../domain/services/IPaymentGateway';
import { User } from '../domain/entities/User';
import { Wedding } from '../domain/entities/Wedding';
import { Gift } from '../domain/entities/Gift';
import { Contribution } from '../domain/entities/Contribution';
import { UniqueId, Slug, Email } from '../domain/value-objects';

/**
 * Mock implementation of repositories and services for testing.
 * Uses in-memory storage to simulate database operations.
 */

export class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: UniqueId): Promise<User | null> {
    return this.users.get(id.value) || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return Array.from(this.users.values()).find(
      (user) => user.email.equals(email)
    ) || null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id.value, user);
    return user;
  }

  async delete(id: UniqueId): Promise<void> {
    this.users.delete(id.value);
  }

  // Helper for tests
  clear(): void {
    this.users.clear();
  }
}

export class MockWeddingRepository implements IWeddingRepository {
  private weddings: Map<string, Wedding> = new Map();

  async findById(id: UniqueId): Promise<Wedding | null> {
    return this.weddings.get(id.value) || null;
  }

  async findBySlug(slug: Slug): Promise<Wedding | null> {
    return Array.from(this.weddings.values()).find(
      (wedding) => wedding.slug.equals(slug)
    ) || null;
  }

  async findByUserId(userId: UniqueId): Promise<Wedding[]> {
    return Array.from(this.weddings.values()).filter(
      (wedding) => wedding.userId.equals(userId)
    );
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    return Array.from(this.weddings.values()).some(
      (wedding) => wedding.slug.equals(slug)
    );
  }

  async save(wedding: Wedding): Promise<Wedding> {
    this.weddings.set(wedding.id.value, wedding);
    return wedding;
  }

  async delete(id: UniqueId): Promise<void> {
    this.weddings.delete(id.value);
  }

  // Helper for tests
  clear(): void {
    this.weddings.clear();
  }
}

export class MockGiftRepository implements IGiftRepository {
  private gifts: Map<string, Gift> = new Map();

  async findById(id: UniqueId): Promise<Gift | null> {
    return this.gifts.get(id.value) || null;
  }

  async findByWeddingId(weddingId: UniqueId): Promise<Gift[]> {
    return Array.from(this.gifts.values()).filter(
      (gift) => gift.weddingId.equals(weddingId)
    );
  }

  async save(gift: Gift): Promise<Gift> {
    this.gifts.set(gift.id.value, gift);
    return gift;
  }

  async delete(id: UniqueId): Promise<void> {
    this.gifts.delete(id.value);
  }

  // Helper for tests
  clear(): void {
    this.gifts.clear();
  }
}

export class MockContributionRepository implements IContributionRepository {
  private contributions: Map<string, Contribution> = new Map();

  async findById(id: UniqueId): Promise<Contribution | null> {
    return this.contributions.get(id.value) || null;
  }

  async findByWeddingId(weddingId: UniqueId): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.weddingId.equals(weddingId)
    );
  }

  async findByGiftId(giftId: UniqueId): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.giftId.equals(giftId)
    );
  }

  async findByPaymentProviderId(providerId: string): Promise<Contribution | null> {
    return Array.from(this.contributions.values()).find(
      (contribution) => contribution.paymentProviderId === providerId
    ) || null;
  }

  async save(contribution: Contribution): Promise<Contribution> {
    this.contributions.set(contribution.id.value, contribution);
    return contribution;
  }

  // Helper for tests
  clear(): void {
    this.contributions.clear();
  }
}

export class MockPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed_${password}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash === `hashed_${password}`;
  }
}

export class MockTokenService implements ITokenService {
  generateToken(payload: { userId: string }): string {
    return `token_${payload.userId}_${Date.now()}`;
  }

  verifyToken(token: string): { userId: string } | null {
    const match = token.match(/^token_(.+)_\d+$/);
    return match ? { userId: match[1] } : null;
  }
}

export class MockEmailService implements IEmailService {
  public sentEmails: Array<{
    to: string;
    type: string;
    data: any;
  }> = [];

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.sentEmails.push({
      to: email,
      type: 'welcome',
      data: { name },
    });
  }

  async sendContributionCreated(
    email: string,
    guestName: string,
    giftTitle: string
  ): Promise<void> {
    this.sentEmails.push({
      to: email,
      type: 'contribution_created',
      data: { guestName, giftTitle },
    });
  }

  async sendContributionPaid(
    email: string,
    guestName: string,
    amount: number
  ): Promise<void> {
    this.sentEmails.push({
      to: email,
      type: 'contribution_paid',
      data: { guestName, amount },
    });
  }

  // Helper for tests
  clear(): void {
    this.sentEmails = [];
  }
}

export class MockPaymentGateway implements IPaymentGateway {
  private payments: Map<string, any> = new Map();
  private preferenceCounter = 1;

  async createPreference(params: {
    contributionId: string;
    weddingId: string;
    amount: number;
    currency: string;
    description: string;
    payerEmail: string;
    payerName: string;
  }): Promise<{ preferenceId: string; checkoutUrl: string }> {
    const preferenceId = `pref_${this.preferenceCounter++}`;
    this.payments.set(preferenceId, {
      ...params,
      status: 'pending',
    });

    return {
      preferenceId,
      checkoutUrl: `https://payment-gateway.test/checkout/${preferenceId}`,
    };
  }

  async getPaymentDetails(paymentId: string): Promise<{
    paymentId: string;
    status: 'approved' | 'pending' | 'rejected';
    externalReference: string;
    amount: number;
    currency: string;
  } | null> {
    const payment = this.payments.get(paymentId);
    if (!payment) return null;

    return {
      paymentId,
      status: payment.status,
      externalReference: payment.contributionId,
      amount: payment.amount,
      currency: payment.currency,
    };
  }

  // Helper for tests
  setPaymentStatus(paymentId: string, status: 'approved' | 'pending' | 'rejected'): void {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
    }
  }

  clear(): void {
    this.payments.clear();
    this.preferenceCounter = 1;
  }
}

