import { Request, Response } from 'express';
import { ContributionService } from '../services/ContributionService';
import { PaymentService } from '../services/PaymentService';
import { WeddingService } from '../services/WeddingService';

/**
 * Controller handling contribution-related requests.
 */
export class ContributionController {
  /**
   * Creates an instance of ContributionController.
   * @param contributionService - The contribution service.
   * @param paymentService - The payment service.
   * @param weddingService - The wedding service.
   */
  constructor(
    private contributionService: ContributionService,
    private paymentService: PaymentService,
    private weddingService: WeddingService
  ) {}

  /**
   * Creates a contribution (public).
   * @param req - Express request object.
   * @param res - Express response object.
   */
  createPublicContribution = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const wedding = await this.weddingService.getWeddingBySlug(slug);
      if (!wedding) return res.status(404).json({ error: { message: 'Wedding not found' } });

      const contribution = await this.contributionService.createContribution(wedding.id, req.body);
      
      let paymentResponse = null;
      if (req.body.paymentMethod === 'MERCADOPAGO') {
         paymentResponse = await this.paymentService.createPreference(contribution.id, wedding.id);
      }

      res.status(201).json({
        contributionId: contribution.id,
        status: contribution.status,
        payment: paymentResponse ? {
            provider: 'MERCADOPAGO',
            preferenceId: paymentResponse.preferenceId,
            checkoutUrl: paymentResponse.checkoutUrl
        } : null
      });
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Retrieves contributions for a wedding (admin).
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getWeddingContributions = async (req: Request, res: Response) => {
      try {
          const { weddingId } = req.params;
          const contributions = await this.contributionService.getWeddingContributions(weddingId);
          res.json(contributions);
      } catch (error: any) {
          res.status(500).json({ error: { message: error.message } });
      }
  };
}
