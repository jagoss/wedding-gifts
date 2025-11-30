/**
 * Dependency Injection Container
 *
 * This is the composition root where all dependencies are wired together.
 * Following the Dependency Inversion Principle, high-level modules (use cases)
 * depend on abstractions (interfaces), not concrete implementations.
 */

// Infrastructure - Repositories
import { InMemoryUserRepository } from '../infrastructure/persistence/InMemoryUserRepository';
import { InMemoryWeddingRepository } from '../infrastructure/persistence/InMemoryWeddingRepository';
import { InMemoryGiftRepository } from '../infrastructure/persistence/InMemoryGiftRepository';
import { InMemoryContributionRepository } from '../infrastructure/persistence/InMemoryContributionRepository';

// Infrastructure - Services
import { ConsoleEmailService } from '../infrastructure/services/ConsoleEmailService';
import { MockPaymentGateway } from '../infrastructure/services/MockPaymentGateway';
import { SimplePasswordHasher } from '../infrastructure/services/SimplePasswordHasher';
import { MockTokenService } from '../infrastructure/services/MockTokenService';

// Application - Use Cases (Auth)
import { RegisterUserUseCase } from '../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../application/use-cases/auth/LoginUserUseCase';
import { ValidateTokenUseCase } from '../application/use-cases/auth/ValidateTokenUseCase';

// Application - Use Cases (Wedding)
import { CreateWeddingUseCase } from '../application/use-cases/wedding/CreateWeddingUseCase';
import { GetWeddingUseCase } from '../application/use-cases/wedding/GetWeddingUseCase';
import { GetWeddingBySlugUseCase } from '../application/use-cases/wedding/GetWeddingBySlugUseCase';
import { GetUserWeddingsUseCase } from '../application/use-cases/wedding/GetUserWeddingsUseCase';
import { UpdateWeddingUseCase } from '../application/use-cases/wedding/UpdateWeddingUseCase';
import { DeleteWeddingUseCase } from '../application/use-cases/wedding/DeleteWeddingUseCase';

// Application - Use Cases (Gift)
import { CreateGiftUseCase } from '../application/use-cases/gift/CreateGiftUseCase';
import { GetGiftUseCase } from '../application/use-cases/gift/GetGiftUseCase';
import { GetWeddingGiftsUseCase } from '../application/use-cases/gift/GetWeddingGiftsUseCase';
import { UpdateGiftUseCase } from '../application/use-cases/gift/UpdateGiftUseCase';
import { DeleteGiftUseCase } from '../application/use-cases/gift/DeleteGiftUseCase';

// Application - Use Cases (Contribution)
import { CreateContributionUseCase } from '../application/use-cases/contribution/CreateContributionUseCase';
import { GetWeddingContributionsUseCase } from '../application/use-cases/contribution/GetWeddingContributionsUseCase';

// Application - Use Cases (Payment)
import { CreatePaymentPreferenceUseCase } from '../application/use-cases/payment/CreatePaymentPreferenceUseCase';
import { HandlePaymentWebhookUseCase } from '../application/use-cases/payment/HandlePaymentWebhookUseCase';

// Infrastructure - HTTP Controllers
import { AuthController } from '../infrastructure/http/controllers/AuthController';
import { WeddingController } from '../infrastructure/http/controllers/WeddingController';
import { GiftController } from '../infrastructure/http/controllers/GiftController';
import { ContributionController } from '../infrastructure/http/controllers/ContributionController';
import { PaymentController } from '../infrastructure/http/controllers/PaymentController';

/**
 * Container holding all instantiated dependencies.
 */
export interface Container {
  // Controllers
  authController: AuthController;
  weddingController: WeddingController;
  giftController: GiftController;
  contributionController: ContributionController;
  paymentController: PaymentController;

  // Use Cases (exposed for middleware)
  validateTokenUseCase: ValidateTokenUseCase;
}

/**
 * Creates and wires all dependencies.
 * This is the single place where concrete implementations are instantiated.
 */
export function createContainer(): Container {
  // ============================================
  // Infrastructure Layer - Concrete Implementations
  // ============================================

  // Repositories (in-memory for now, can be swapped for DB implementations)
  const userRepository = new InMemoryUserRepository();
  const weddingRepository = new InMemoryWeddingRepository();
  const giftRepository = new InMemoryGiftRepository();
  const contributionRepository = new InMemoryContributionRepository();

  // External Services (mock implementations for development)
  const emailService = new ConsoleEmailService();
  const paymentGateway = new MockPaymentGateway();
  const passwordHasher = new SimplePasswordHasher();
  const tokenService = new MockTokenService();

  // ============================================
  // Application Layer - Use Cases
  // ============================================

  // Auth Use Cases
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
  const validateTokenUseCase = new ValidateTokenUseCase(userRepository, tokenService);

  // Wedding Use Cases
  const createWeddingUseCase = new CreateWeddingUseCase(weddingRepository);
  const getWeddingUseCase = new GetWeddingUseCase(weddingRepository);
  const getWeddingBySlugUseCase = new GetWeddingBySlugUseCase(weddingRepository, giftRepository);
  const getUserWeddingsUseCase = new GetUserWeddingsUseCase(weddingRepository);
  const updateWeddingUseCase = new UpdateWeddingUseCase(weddingRepository);
  const deleteWeddingUseCase = new DeleteWeddingUseCase(weddingRepository);

  // Gift Use Cases
  const createGiftUseCase = new CreateGiftUseCase(giftRepository);
  const getGiftUseCase = new GetGiftUseCase(giftRepository);
  const getWeddingGiftsUseCase = new GetWeddingGiftsUseCase(giftRepository);
  const updateGiftUseCase = new UpdateGiftUseCase(giftRepository);
  const deleteGiftUseCase = new DeleteGiftUseCase(giftRepository);

  // Contribution Use Cases
  const createContributionUseCase = new CreateContributionUseCase(
    weddingRepository,
    giftRepository,
    contributionRepository,
    emailService,
    paymentGateway
  );
  const getWeddingContributionsUseCase = new GetWeddingContributionsUseCase(contributionRepository);

  // Payment Use Cases
  const createPaymentPreferenceUseCase = new CreatePaymentPreferenceUseCase(
    contributionRepository,
    paymentGateway
  );
  const handlePaymentWebhookUseCase = new HandlePaymentWebhookUseCase(
    contributionRepository,
    paymentGateway,
    emailService
  );

  // ============================================
  // Infrastructure Layer - HTTP Controllers
  // ============================================

  const authController = new AuthController(registerUserUseCase, loginUserUseCase);

  const weddingController = new WeddingController(
    createWeddingUseCase,
    getWeddingUseCase,
    getWeddingBySlugUseCase,
    getUserWeddingsUseCase,
    updateWeddingUseCase,
    deleteWeddingUseCase
  );

  const giftController = new GiftController(
    createGiftUseCase,
    getGiftUseCase,
    getWeddingGiftsUseCase,
    updateGiftUseCase,
    deleteGiftUseCase
  );

  const contributionController = new ContributionController(
    createContributionUseCase,
    getWeddingContributionsUseCase
  );

  const paymentController = new PaymentController(
    createPaymentPreferenceUseCase,
    handlePaymentWebhookUseCase
  );

  return {
    authController,
    weddingController,
    giftController,
    contributionController,
    paymentController,
    validateTokenUseCase,
  };
}
