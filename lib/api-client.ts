// ============================================
// GRSS FIELD ANALYST — Centralized API Client
// ============================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 1, ...fetchOptions } = options;
  const url = `${BASE_URL}${path}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let lastError: Error = new Error('Request failed');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...fetchOptions,
        headers: { ...defaultHeaders, ...fetchOptions.headers },
        credentials: 'include', // include cookies for HTTP-only JWT
      });

      if (!res.ok) {
        const body = await res.text();
        throw new ApiError(res.status, body || res.statusText);
      }

      // Handle empty responses (204 No Content)
      const text = await res.text();
      return (text ? JSON.parse(text) : {}) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        // Exponential back-off: 400ms, 800ms
        await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

export const apiClient = {
  get: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: FetchOptions) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),
};

// Health check convenience method
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await apiClient.get('/api');
    return true;
  } catch {
    return false;
  }
}
