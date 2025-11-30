import { Request, Response } from 'express';
import { CreatePaymentPreferenceUseCase } from '../../../application/use-cases/payment/CreatePaymentPreferenceUseCase';
import { HandlePaymentWebhookUseCase } from '../../../application/use-cases/payment/HandlePaymentWebhookUseCase';
import { handleHttpError } from '../errorHandler';

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
      // Always return 200 for webhooks to prevent retries
      console.error('[Webhook] Error processing:', error);
      res.status(200).send();
    }
  };
}
