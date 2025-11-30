import { Request, Response } from 'express';
import { CreateContributionUseCase } from '../../../application/use-cases/contribution/CreateContributionUseCase';
import { GetWeddingContributionsUseCase } from '../../../application/use-cases/contribution/GetWeddingContributionsUseCase';
import { handleHttpError } from '../errorHandler';

/**
 * HTTP Controller for contribution endpoints.
 * Adapts HTTP requests to use case invocations.
 */
export class ContributionController {
  constructor(
    private readonly createContributionUseCase: CreateContributionUseCase,
    private readonly getWeddingContributionsUseCase: GetWeddingContributionsUseCase
  ) {}

  /**
   * POST /public/weddings/:slug/contributions
   * Creates a public contribution.
   */
  createPublicContribution = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const result = await this.createContributionUseCase.execute({
        weddingSlug: slug,
        ...req.body,
      });
      res.status(201).json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * GET /weddings/:weddingId/contributions
   * Gets all contributions for a wedding (admin).
   */
  getWeddingContributions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { weddingId } = req.params;
      const result = await this.getWeddingContributionsUseCase.execute(weddingId);
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };
}
