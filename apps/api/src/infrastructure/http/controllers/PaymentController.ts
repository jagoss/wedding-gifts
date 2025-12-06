import { Request, Response } from 'express';
import { CreatePaymentPreferenceUseCase } from '../../../application/use-cases/payment/CreatePaymentPreferenceUseCase';
import { HandlePaymentWebhookUseCase } from '../../../application/use-cases/payment/HandlePaymentWebhookUseCase';
import { handleHttpError } from '../errorHandler';
import { ValidationError } from '../../../domain/errors/DomainError';

/**
 * HTTP Controller for payment endpoints.
 * Adapts HTTP requests to use case invocations.
 */
export class PaymentController {
  constructor(
    private readonly createPaymentPreferenceUseCase: CreatePaymentPreferenceUseCase,
    private readonly handlePaymentWebhookUseCase: HandlePaymentWebhookUseCase
  ) {}

  /**
   * POST /payments/mercadopago/preference
   * Creates a payment preference.
   */
  createPreference = async (req: Request, res: Response): Promise<void> => {
    try {
      const { weddingId, contributionId } = req.body;

      // Validate required fields
      if (!weddingId) {
        throw new ValidationError('Wedding ID is required');
      }
      if (!contributionId) {
        throw new ValidationError('Contribution ID is required');
      }

      const result = await this.createPaymentPreferenceUseCase.execute({
        contributionId,
        weddingId,
      });
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * POST /webhooks/mercadopago
   * Handles payment webhooks.
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.handlePaymentWebhookUseCase.execute(req.body);
      res.status(200).send();
    } catch (error) {
      // Handle validation errors with 400, but other errors with 200 to prevent retries
      if (error instanceof Error && error.name === 'ValidationError') {
        handleHttpError(res, error);
      } else {
        console.error('[Webhook] Error processing:', error);
        res.status(200).send();
      }
    }
  };
}
