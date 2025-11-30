import { Request, Response } from 'express';
import { WeddingService } from '../services/WeddingService';

/**
 * Controller handling wedding-related requests.
 */
export class WeddingController {
  /**
   * Creates an instance of WeddingController.
   * @param weddingService - The wedding service.
   */
  constructor(private weddingService: WeddingService) {}

  /**
   * Creates a new wedding.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  createWedding = async (req: Request, res: Response) => {
    try {
      // Assuming userId is attached to req.user by auth middleware
      const userId = (req as any).user.id;
      const wedding = await this.weddingService.createWedding(userId, req.body);
      res.status(201).json(wedding);
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Retrieves weddings for the authenticated user.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getUserWeddings = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const weddings = await this.weddingService.getUserWeddings(userId);
      res.json(weddings);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  };

  /**
   * Retrieves a specific wedding by ID.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getWedding = async (req: Request, res: Response) => {
    try {
      const { weddingId } = req.params;
      const wedding = await this.weddingService.getWeddingById(weddingId);
      if (!wedding) {
        return res.status(404).json({ error: { message: 'Wedding not found' } });
      }
      res.json(wedding);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  };

  /**
   * Updates a wedding.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  updateWedding = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { weddingId } = req.params;
      const wedding = await this.weddingService.updateWedding(weddingId, userId, req.body);
      res.json(wedding);
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Deletes a wedding.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  deleteWedding = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { weddingId } = req.params;
      await this.weddingService.deleteWedding(weddingId, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };
  
  /**
   * Retrieves public wedding details by slug.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getPublicWedding = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const wedding = await this.weddingService.getWeddingBySlug(slug);
      if (!wedding) {
        return res.status(404).json({ error: { message: 'Wedding not found' } });
      }
      // TODO: Fetch gifts and return { wedding, gifts }
      // For now just wedding
      res.json({ wedding, gifts: [] });
    } catch (error: any) {
        res.status(500).json({ error: { message: error.message } });
    }
  }
}
