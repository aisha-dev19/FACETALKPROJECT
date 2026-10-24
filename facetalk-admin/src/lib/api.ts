const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Called when the server says the login is no longer valid
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Options = {
  method?: string;
  body?: unknown;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      credentials: "include", // sends and receives the admin login cookie
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Please check that it is running.",
      0,
    );
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // the response had no body
  }

  if (!response.ok) {
    // A 401 on a data page means the session ended. (The login and "who am I"
    // requests are excluded: a 401 there is normal.)
    if (response.status === 401 && !path.startsWith("/api/admin/auth/")) {
      onUnauthorized?.();
    }

    const message =
      (data as { message?: string } | null)?.message ??
      "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}