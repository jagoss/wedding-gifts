import { Email, Money, Slug, UniqueId } from "../../../../domain/value-objects";
import { User } from "../../../../domain/entities/User";
import { Wedding } from "../../../../domain/entities/Wedding";
import { Gift, GiftType } from "../../../../domain/entities/Gift";
import { Contribution, ContributionType, PaymentProvider } from "../../../../domain/entities/Contribution";
import type { Sequelize } from "sequelize";
import type { SequelizeUserRepository } from "../SequelizeUserRepository";
import type { SequelizeWeddingRepository } from "../SequelizeWeddingRepository";
import type { SequelizeGiftRepository } from "../SequelizeGiftRepository";
import type { SequelizeContributionRepository } from "../SequelizeContributionRepository";

describe("Sequelize repositories (sqlite in-memory)", () => {
  let sequelize: Sequelize;
  let userRepo: SequelizeUserRepository;
  let weddingRepo: SequelizeWeddingRepository;
  let giftRepo: SequelizeGiftRepository;
  let contributionRepo: SequelizeContributionRepository;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.SEQ_DIALECT = "sqlite";
    // dynamic imports after env is set
    const db = await import("../../../db/sequelize");
    await import("../../../db/models");
    sequelize = db.sequelize;
    const { SequelizeUserRepository } = await import("../SequelizeUserRepository");
    const { SequelizeWeddingRepository } = await import("../SequelizeWeddingRepository");
    const { SequelizeGiftRepository } = await import("../SequelizeGiftRepository");
    const { SequelizeContributionRepository } = await import("../SequelizeContributionRepository");

    userRepo = new SequelizeUserRepository();
    weddingRepo = new SequelizeWeddingRepository();
    giftRepo = new SequelizeGiftRepository();
    contributionRepo = new SequelizeContributionRepository();

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("creates and fetches user and wedding by slug", async () => {
    const email = Email.create("test@example.com");
    const user = User.create("Tester", email, "hashed");
    await userRepo.save(user);

    const slug = Slug.create("my-wedding");
    const wedding = Wedding.create({
      userId: user.id,
      title: "My Wedding",
      slug,
      date: null,
      location: "City",
      message: null,
      heroImageUrl: null,
      bankAccounts: []
    });
    await weddingRepo.save(wedding);

    const foundUser = await userRepo.findByEmail(email);
    const foundWedding = await weddingRepo.findBySlug(slug);

    expect(foundUser?.id.equals(user.id)).toBe(true);
    expect(foundWedding?.slug.equals(slug)).toBe(true);
    expect(await weddingRepo.existsBySlug(slug)).toBe(true);
  });

  it("saves and lists gifts for a wedding", async () => {
    const user = User.create("Gifter", Email.create("gifter@example.com"), "hashed");
    await userRepo.save(user);
    const wedding = Wedding.create({
      userId: user.id,
      title: "Gift Wedding",
      slug: Slug.create("gift-wedding"),
      date: null,
      location: null,
      message: null,
      heroImageUrl: null,
      bankAccounts: []
    });
    await weddingRepo.save(wedding);

    const gift = Gift.create({
      weddingId: wedding.id,
      title: "Gift A",
      description: "desc",
      estimatedPrice: Money.create(50, "USD"),
      type: GiftType.PRODUCT
    });
    await giftRepo.save(gift);

    const gifts = await giftRepo.findByWeddingId(wedding.id);
    expect(gifts.length).toBeGreaterThanOrEqual(1);
    expect(gifts[0].title).toBe("Gift A");
  });

  it("saves and reads contributions with amount/currency", async () => {
    const user = User.create("Contrib", Email.create("contrib@example.com"), "hashed");
    await userRepo.save(user);
    const wedding = Wedding.create({
      userId: user.id,
      title: "Contrib Wedding",
      slug: Slug.create("contrib-wedding"),
      date: null,
      location: null,
      message: null,
      heroImageUrl: null,
      bankAccounts: []
    });
    await weddingRepo.save(wedding);

    const gift = Gift.create({
      weddingId: wedding.id,
      title: "Gift B",
      description: null,
      estimatedPrice: Money.create(75, "USD"),
      type: GiftType.PRODUCT
    });
    await giftRepo.save(gift);

    const contrib = Contribution.create({
      weddingId: wedding.id,
      giftId: gift.id,
      guestName: "Guest",
      guestEmail: Email.create("guest@example.com"),
      type: ContributionType.CONTRIBUTION,
      amount: Money.create(20, "USD"),
      paymentProvider: PaymentProvider.MERCADOPAGO
    });
    contrib.setPaymentProviderId("pref-123");
    contrib.markAsPaid();
    await contributionRepo.save(contrib);

    const list = await contributionRepo.findByWeddingId(wedding.id);
    expect(list.length).toBe(1);
    expect(list[0].amount?.amount).toBe(20);
    expect(list[0].amount?.currency).toBe("USD");
    expect(list[0].paymentProviderId).toBe("pref-123");
  });
});

