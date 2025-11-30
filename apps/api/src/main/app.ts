import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createContainer } from './container';
import { createAuthMiddleware } from '../infrastructure/http/middleware/authMiddleware';

/**
 * Creates and configures the Express application.
 * This is the main entry point that wires together all components.
 */
export function createApp() {
  const app = express();

  // ============================================
  // Global Middleware
  // ============================================
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // ============================================
  // Dependency Injection
  // ============================================
  const container = createContainer();
  const requireAuth = createAuthMiddleware(container.validateTokenUseCase);

  // ============================================
  // Routes
  // ============================================

  // Auth Routes (public)
  app.post('/auth/register', container.authController.register);
  app.post('/auth/login', container.authController.login);

  // Wedding Routes (authenticated)
  app.get('/weddings/me', requireAuth, container.weddingController.getUserWeddings);
  app.post('/weddings', requireAuth, container.weddingController.createWedding);
  app.get('/weddings/:weddingId', requireAuth, container.weddingController.getWedding);
  app.patch('/weddings/:weddingId', requireAuth, container.weddingController.updateWedding);
  app.delete('/weddings/:weddingId', requireAuth, container.weddingController.deleteWedding);

  // Public Wedding Routes
  app.get('/public/weddings/:slug', container.weddingController.getPublicWedding);

  // Gift Routes (authenticated)
  app.get('/weddings/:weddingId/gifts', requireAuth, container.giftController.getWeddingGifts);
  app.post('/weddings/:weddingId/gifts', requireAuth, container.giftController.createGift);
  app.get('/weddings/:weddingId/gifts/:giftId', requireAuth, container.giftController.getGift);
  app.patch('/weddings/:weddingId/gifts/:giftId', requireAuth, container.giftController.updateGift);
  app.delete('/weddings/:weddingId/gifts/:giftId', requireAuth, container.giftController.deleteGift);

  // Contribution Routes
  app.post('/public/weddings/:slug/contributions', container.contributionController.createPublicContribution);
  app.get('/weddings/:weddingId/contributions', requireAuth, container.contributionController.getWeddingContributions);

  // Payment Routes
  app.post('/payments/mercadopago/preference', requireAuth, container.paymentController.createPreference);
  app.post('/webhooks/mercadopago', container.paymentController.handleWebhook);

  return app;
}
