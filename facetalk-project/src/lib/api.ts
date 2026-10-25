// While developing, the server runs on port 5000. Once deployed, requests go to
// the same address as the page, and vercel.json forwards /api/... to the server.
const API_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL ?? "http://localhost:5000")
  : "";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
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
      credentials: "include", // sends and receives the login cookie
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Please check your connection and try again.",
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
    const message =
      (data as { message?: string } | null)?.message ??
      "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}