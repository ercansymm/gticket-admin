const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL tanımlı değil");
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  isNetworkError: boolean;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.errors = params.errors;
    this.isNetworkError = params.isNetworkError ?? false;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
  signal?: AbortSignal;
}

let onAuthFailure: (() => void) | null = null;

export function setOnAuthFailure(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Allow next refresh after this one settles
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();
  return refreshPromise;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    // Drain body to avoid leaks
    try {
      await response.text();
    } catch {
      /* ignore */
    }
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    skipAuthRefresh = false,
    signal,
  } = options;

  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    finalHeaders["Content-Type"] =
      finalHeaders["Content-Type"] ?? "application/json";
    serializedBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: finalHeaders,
      body: serializedBody,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new ApiError({
      status: 0,
      message: "Network error",
      isNetworkError: true,
    });
  }

  if (response.status === 401 && !skipAuthRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, skipAuthRefresh: true });
    }
    if (onAuthFailure) {
      try {
        onAuthFailure();
      } catch {
        /* ignore */
      }
    }
    throw new ApiError({ status: 401, message: "Unauthorized" });
  }

  const payload = (await parseBody(response)) as
    | (ApiErrorBody & Record<string, unknown>)
    | null
    | undefined;

  if (!response.ok) {
    const errBody = (payload ?? {}) as ApiErrorBody;
    throw new ApiError({
      status: response.status,
      message:
        errBody.message ??
        `Request failed with status ${response.status}`,
      code: errBody.code,
      errors: errBody.errors,
    });
  }

  return payload as T;
}

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "POST", body });
  },
  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "PUT", body });
  },
  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
