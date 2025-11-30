import { Request, Response } from 'express';
import { CreateWeddingUseCase } from '../../../application/use-cases/wedding/CreateWeddingUseCase';
import { GetWeddingUseCase } from '../../../application/use-cases/wedding/GetWeddingUseCase';
import { GetWeddingBySlugUseCase } from '../../../application/use-cases/wedding/GetWeddingBySlugUseCase';
import { GetUserWeddingsUseCase } from '../../../application/use-cases/wedding/GetUserWeddingsUseCase';
import { UpdateWeddingUseCase } from '../../../application/use-cases/wedding/UpdateWeddingUseCase';
import { DeleteWeddingUseCase } from '../../../application/use-cases/wedding/DeleteWeddingUseCase';
import { handleHttpError } from '../errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * HTTP Controller for wedding endpoints.
 * Adapts HTTP requests to use case invocations.
 */
export class WeddingController {
  constructor(
    private readonly createWeddingUseCase: CreateWeddingUseCase,
    private readonly getWeddingUseCase: GetWeddingUseCase,
    private readonly getWeddingBySlugUseCase: GetWeddingBySlugUseCase,
    private readonly getUserWeddingsUseCase: GetUserWeddingsUseCase,
    private readonly updateWeddingUseCase: UpdateWeddingUseCase,
    private readonly deleteWeddingUseCase: DeleteWeddingUseCase
  ) {}

  /**
   * POST /weddings
   * Creates a new wedding.
   */
  createWedding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.createWeddingUseCase.execute({
        userId,
        ...req.body,
      });
      res.status(201).json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * GET /weddings/me
   * Gets all weddings for the authenticated user.
   */
  getUserWeddings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.getUserWeddingsUseCase.execute(userId);
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * GET /weddings/:weddingId
   * Gets a specific wedding by ID.
   */
  getWedding = async (req: Request, res: Response): Promise<void> => {
    try {
      const { weddingId } = req.params;
      const result = await this.getWeddingUseCase.execute(weddingId);
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * PATCH /weddings/:weddingId
   * Updates a wedding.
   */
  updateWedding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { weddingId } = req.params;
      const result = await this.updateWeddingUseCase.execute({
        weddingId,
        userId,
        ...req.body,
      });
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * DELETE /weddings/:weddingId
   * Deletes a wedding.
   */
  deleteWedding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { weddingId } = req.params;
      await this.deleteWeddingUseCase.execute({ weddingId, userId });
      res.status(204).send();
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * GET /public/weddings/:slug
   * Gets public wedding details by slug.
   */
  getPublicWedding = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const result = await this.getWeddingBySlugUseCase.execute(slug);
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };
}
