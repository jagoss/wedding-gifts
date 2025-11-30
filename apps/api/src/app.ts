import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AuthController } from './controllers/AuthController';
import { WeddingController } from './controllers/WeddingController';
import { GiftController } from './controllers/GiftController';
import { ContributionController } from './controllers/ContributionController';
import { PaymentController } from './controllers/PaymentController';

// Repositories
import { UserRepository } from './repositories/UserRepository';
import { WeddingRepository } from './repositories/WeddingRepository';
import { GiftRepository } from './repositories/GiftRepository';
import { ContributionRepository } from './repositories/ContributionRepository';

// Services
import { AuthService } from './services/AuthService';
import { WeddingService } from './services/WeddingService';
import { GiftService } from './services/GiftService';
import { ContributionService } from './services/ContributionService';
import { PaymentService } from './services/PaymentService';
import { EmailService } from './services/EmailService';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Dependency Injection
  const userRepo = new UserRepository();
  const weddingRepo = new WeddingRepository();
  const giftRepo = new GiftRepository();
  const contributionRepo = new ContributionRepository();

  const emailService = new EmailService();
  const authService = new AuthService(userRepo);
  const weddingService = new WeddingService(weddingRepo);
  const giftService = new GiftService(giftRepo);
  const contributionService = new ContributionService(contributionRepo, giftRepo, emailService);
  const paymentService = new PaymentService(contributionService);

  const authController = new AuthController(authService);
  const weddingController = new WeddingController(weddingService);
  const giftController = new GiftController(giftService);
  const contributionController = new ContributionController(contributionService, paymentService, weddingService);
  const paymentController = new PaymentController(paymentService);

  // Middleware to mock auth
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const user = await authService.validateToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    (req as any).user = user;
    next();
  };

  // Routes
  
  // Auth
  app.post('/auth/register', authController.register);
  app.post('/auth/login', authController.login);

  // Weddings
  app.get('/weddings/me', requireAuth, weddingController.getUserWeddings);
  app.post('/weddings', requireAuth, weddingController.createWedding);
  app.get('/weddings/:weddingId', requireAuth, weddingController.getWedding);
  app.patch('/weddings/:weddingId', requireAuth, weddingController.updateWedding);
  app.delete('/weddings/:weddingId', requireAuth, weddingController.deleteWedding);

  // Public Wedding
  app.get('/public/weddings/:slug', weddingController.getPublicWedding);

  // Gifts
  app.get('/weddings/:weddingId/gifts', requireAuth, giftController.getWeddingGifts);
  app.post('/weddings/:weddingId/gifts', requireAuth, giftController.createGift);
  app.get('/weddings/:weddingId/gifts/:giftId', requireAuth, giftController.getGift);
  app.patch('/weddings/:weddingId/gifts/:giftId', requireAuth, giftController.updateGift);
  app.delete('/weddings/:weddingId/gifts/:giftId', requireAuth, giftController.deleteGift);

  // Contributions (Public)
  app.post('/public/weddings/:slug/contributions', contributionController.createPublicContribution);

  // Contributions (Admin)
  app.get('/weddings/:weddingId/contributions', requireAuth, contributionController.getWeddingContributions);

  // Payments
  app.post('/payments/mercadopago/preference', requireAuth, paymentController.createPreference);
  app.post('/webhooks/mercadopago', paymentController.handleWebhook);

  return app;
}
