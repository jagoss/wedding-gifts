export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface HttpClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null;
}

export interface HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => string | null;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.getAccessToken = config.getAccessToken;
  }

  async request<T>(path: string, method: HttpMethod, body?: unknown, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers ?? {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAccessToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      ...init,
      headers
    });

    if (!response.ok) {
      const error: HttpError = new Error("HTTP Error") as HttpError;
      error.status = response.status;
      try {
        const payload = await response.json();
        error.code = payload?.error?.code;
        error.message = payload?.error?.message ?? response.statusText;
        error.details = payload;
      } catch {
        error.message = response.statusText;
      }
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, "GET", undefined, init);
  }

  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, "POST", body, init);
  }

  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, "PATCH", body, init);
  }

  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, "DELETE", undefined, init);
  }
}

