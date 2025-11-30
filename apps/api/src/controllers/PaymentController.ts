import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';

/**
 * Controller handling payment-related requests.
 */
export class PaymentController {
  /**
   * Creates an instance of PaymentController.
   * @param paymentService - The payment service.
   */
  constructor(private paymentService: PaymentService) {}

  /**
   * Creates a payment preference.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  createPreference = async (req: Request, res: Response) => {
    try {
      const { weddingId, contributionId } = req.body;
      const result = await this.paymentService.createPreference(contributionId, weddingId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Handles payment webhooks.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  handleWebhook = async (req: Request, res: Response) => {
    try {
      await this.paymentService.handleWebhook(req.body);
      res.status(200).send();
    } catch (error: any) {
      res.status(400).send();
    }
  };
}
