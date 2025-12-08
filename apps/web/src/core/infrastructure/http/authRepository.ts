import { AuthTokens } from "@/core/domain/models";
import { AuthRepository, LoginRequest, RegisterRequest } from "@/core/domain/repositories";
import { HttpClient } from "./httpClient";

export class AuthHttpRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  login(input: LoginRequest): Promise<AuthTokens> {
    return this.http.post<AuthTokens>("/auth/login", input);
  }

  register(input: RegisterRequest): Promise<AuthTokens> {
    return this.http.post<AuthTokens>("/auth/register", input);
  }
}

