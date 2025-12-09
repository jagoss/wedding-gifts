import dotenv from 'dotenv';
import { SimplePasswordHasher } from '../infrastructure/services/SimplePasswordHasher';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';
import { Wedding } from '../domain/entities/Wedding';
import { Slug } from '../domain/value-objects/Slug';
import { Gift, GiftType } from '../domain/entities/Gift';
import { UniqueId, Money, Email as EmailVO } from '../domain/value-objects';
import { Contribution, ContributionType, PaymentProvider } from '../domain/entities/Contribution';
import { connectSequelize } from '../infrastructure/db/sequelize';
import {
  SequelizeUserRepository,
  SequelizeWeddingRepository,
  SequelizeGiftRepository,
  SequelizeContributionRepository,
} from '../infrastructure/persistence';

dotenv.config();

async function seed() {
  await connectSequelize();
  
  // Import sequelize instance and sync all models (create tables if they don't exist)
  const { sequelize } = await import('../infrastructure/db/sequelize');
  await sequelize.sync({ alter: false });
  console.log('📊 Database tables synchronized');

  const userRepo = new SequelizeUserRepository();
  const weddingRepo = new SequelizeWeddingRepository();
  const giftRepo = new SequelizeGiftRepository();
  const contributionRepo = new SequelizeContributionRepository();

  const passwordHasher = new SimplePasswordHasher();

  const adminEmail = Email.create(process.env.SEED_ADMIN_EMAIL || 'demo.admin@example.com');
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'demo1234';
  const adminName = process.env.SEED_ADMIN_NAME || 'Demo Admin';

  let admin = await userRepo.findByEmail(adminEmail);
  if (!admin) {
    const hashed = await passwordHasher.hash(adminPassword);
    admin = User.create(adminName, adminEmail, hashed);
    await userRepo.save(admin);
    console.log('👤 Admin created:', admin.email.value);
  } else {
    console.log('👤 Admin already exists:', admin.email.value);
  }

  const slug = Slug.create('demo-wedding');
  let wedding = await weddingRepo.findBySlug(slug);
  if (!wedding) {
    wedding = Wedding.create({
      userId: admin.id,
      title: 'Boda de Ejemplo',
      slug,
      date: null,
      location: 'Montevideo',
      message: 'Gracias por acompañarnos en este día especial.',
      heroImageUrl: null,
      bankAccounts: [],
    });
    await weddingRepo.save(wedding);
    console.log('💍 Wedding created with slug demo-wedding');
  } else {
    console.log('💍 Wedding already exists with slug demo-wedding');
  }

  const existingGifts = await giftRepo.findByWeddingId(wedding.id);
  if (existingGifts.length === 0) {
    const gifts: Gift[] = [
      Gift.create({
        weddingId: wedding.id,
        title: 'Cafetera de filtro',
        description: 'Para los desayunos juntos',
        estimatedPrice: Money.create(120, 'USD'),
        type: GiftType.PRODUCT,
      }),
      Gift.create({
        weddingId: wedding.id,
        title: 'Aporte luna de miel',
        description: 'Contribución flexible',
        estimatedPrice: Money.create(300, 'USD'),
        type: GiftType.FUND,
      }),
    ];

    for (const gift of gifts) {
      await giftRepo.save(gift);
    }
    console.log('🎁 Demo gifts inserted');
  } else {
    console.log('🎁 Gifts already present, skipping seed');
  }

  const demoGift = (await giftRepo.findByWeddingId(wedding.id))[0];
  if (demoGift) {
    const existingContribs = await contributionRepo.findByWeddingId(wedding.id);
    if (existingContribs.length === 0) {
      try {
        const contrib = Contribution.create({
          weddingId: wedding.id,
          giftId: demoGift.id,
          guestName: 'Invitado Demo',
          guestEmail: EmailVO.create('guest@example.com'),
          type: ContributionType.CONTRIBUTION,
          amount: Money.create(50, 'USD'),
          paymentProvider: PaymentProvider.MERCADOPAGO,
        });
        contrib.setPaymentProviderId(UniqueId.create().value);
        contrib.markAsPaid();
        await contributionRepo.save(contrib);
        console.log('🤝 Demo contribution inserted');
      } catch (err) {
        console.warn('No se pudo insertar contribución demo', err);
      }
    }
  }

  console.log('✅ Seed completed');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});

