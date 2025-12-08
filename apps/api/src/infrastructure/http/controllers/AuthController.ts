import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUserUseCase';
import { handleHttpError } from '../errorHandler';

/**
 * HTTP Controller for authentication endpoints.
 * Adapts HTTP requests to use case invocations.
 */
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  /**
   * POST /auth/register
   * Registers a new user.
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await this.registerUserUseCase.execute({
        name,
        email,
        password,
      });
      res.status(201).json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };

  /**
   * POST /auth/login
   * Authenticates a user.
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUserUseCase.execute({ email, password });
      res.status(200).json(result);
    } catch (error) {
      handleHttpError(res, error);
    }
  };
}
