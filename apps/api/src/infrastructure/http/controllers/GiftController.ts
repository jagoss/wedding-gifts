import { Request, Response } from 'express';
import { CreateGiftUseCase } from '../../../application/use-cases/gift/CreateGiftUseCase';
import { GetGiftUseCase } from '../../../application/use-cases/gift/GetGiftUseCase';
import { GetWeddingGiftsUseCase } from '../../../application/use-cases/gift/GetWeddingGiftsUseCase';
import { UpdateGiftUseCase } from '../../../application/use-cases/gift/UpdateGiftUseCase';
import { DeleteGiftUseCase } from '../../../application/use-cases/gift/DeleteGiftUseCase';
import { handleHttpError } from '../errorHandler';

/**
 * HTTP Controller for gift endpoints.
 * Adapts HTTP requests to use case invocations.
 */
export class GiftController {
  constructor(
    private readonly createGiftUseCase: CreateGiftUseCase,
    private readonly getGiftUseCase: GetGiftUseCase,
    private readonly getWeddingGiftsUseCase: GetWeddingGiftsUseCase,
    private readonly updateGiftUseCase: UpdateGiftUseCase,
    private readonly deleteGiftUseCase: DeleteGiftUseCase
  ) {}

  /**
   * GET /weddings/:weddingId/gifts
   * Gets all gifts for a wedding.
   */
  getWeddingGifts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { weddingId } = req.params;
      const result = await this.getWeddingGiftsUseCase.execute(weddingId);
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * POST /weddings/:weddingId/gifts
   * Creates a new gift.
   */
  createGift = async (req: Request, res: Response): Promise<void> => {
    try {
      const { weddingId } = req.params;
      const result = await this.createGiftUseCase.execute({
        weddingId,
        ...req.body,
      });
      res.status(201).json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * GET /weddings/:weddingId/gifts/:giftId
   * Gets a specific gift.
   */
  getGift = async (req: Request, res: Response): Promise<void> => {
    try {
      const { giftId } = req.params;
      const result = await this.getGiftUseCase.execute(giftId);
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * PATCH /weddings/:weddingId/gifts/:giftId
   * Updates a gift.
   */
  updateGift = async (req: Request, res: Response): Promise<void> => {
    try {
      const { giftId } = req.params;
      const result = await this.updateGiftUseCase.execute({
        giftId,
        ...req.body,
      });
      res.json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * DELETE /weddings/:weddingId/gifts/:giftId
   * Deletes a gift.
   */
  deleteGift = async (req: Request, res: Response): Promise<void> => {
    try {
      const { giftId } = req.params;
      await this.deleteGiftUseCase.execute(giftId);
      res.status(204).send();
    } catch (error) {
      handleHttpError(res, error);
    }
  };
}
