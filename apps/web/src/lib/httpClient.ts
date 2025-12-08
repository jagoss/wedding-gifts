import { HttpClient } from "@/core/infrastructure/http/httpClient";
import { apiBaseUrl } from "./env";
import { getStoredToken } from "./auth-storage";

export const httpClient = new HttpClient({
  baseUrl: apiBaseUrl,
  getAccessToken: () => getStoredToken()
});

