import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

/**
 * Controller handling authentication requests.
 */
export class AuthController {
  /**
   * Creates an instance of AuthController.
   * @param authService - The authentication service.
   */
  constructor(private authService: AuthService) {}

  /**
   * Registers a new user.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.register(name, email, password);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  };

  /**
   * Logs in a user.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({
        accessToken: result.token,
        user: result.user
      });
    } catch (error: any) {
      res.status(401).json({ error: { message: error.message } });
    }
  };
}
