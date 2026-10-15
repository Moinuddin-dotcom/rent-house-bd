const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export const TOKEN_KEY = 'rhbd_token';
/** Fired on `window` when the API rejects the stored token (expired, or cleared in another tab). */
export const SESSION_EXPIRED_EVENT = 'rhbd:session-expired';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export const tokenStorage = {
  get: () => (typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => window.localStorage.setItem(TOKEN_KEY, token),
  clear: () => window.localStorage.removeItem(TOKEN_KEY),
};

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Query;
}

export function buildQuery(query?: Query) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function api<T>(path: string, { body, query, headers, ...init }: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get();
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
    ...init,
    headers: {
      ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && token) {
    tokenStorage.clear();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    throw new ApiError('Your session has expired. Please log in again.', 401);
  }

  if (!res.ok) {
    let message = res.statusText || 'Request failed';
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }

  // Nest sends an empty body for `null` / void responses
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Server-side fetch for public data (used by Server Components). */
export async function serverApi<T>(path: string, query?: Query, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}${buildQuery(query)}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
