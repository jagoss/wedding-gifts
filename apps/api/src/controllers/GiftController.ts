import { Request, Response } from 'express';
import { GiftService } from '../services/GiftService';

/**
 * Controller handling gift-related requests.
 */
export class GiftController {
  /**
   * Creates an instance of GiftController.
   * @param giftService - The gift service.
   */
  constructor(private giftService: GiftService) {}

  /**
   * Retrieves all gifts for a specific wedding.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getWeddingGifts = async (req: Request, res: Response) => {
    try {
      const { weddingId } = req.params;
      const gifts = await this.giftService.getWeddingGifts(weddingId);
      res.json(gifts);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  };

  /**
   * Creates a new gift.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  createGift = async (req: Request, res: Response) => {
    try {
      const { weddingId } = req.params;
      const gift = await this.giftService.createGift(weddingId, req.body);
      res.status(201).json(gift);
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Retrieves a specific gift by ID.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getGift = async (req: Request, res: Response) => {
    try {
      const { giftId } = req.params;
      const gift = await this.giftService.getGift(giftId);
      if (!gift) return res.status(404).json({ error: { message: 'Gift not found' } });
      res.json(gift);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  };

  /**
   * Updates a gift.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  updateGift = async (req: Request, res: Response) => {
    try {
      const { giftId } = req.params;
      const gift = await this.giftService.updateGift(giftId, req.body);
      res.json(gift);
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Deletes a gift.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  deleteGift = async (req: Request, res: Response) => {
    try {
      const { giftId } = req.params;
      await this.giftService.deleteGift(giftId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };
}
