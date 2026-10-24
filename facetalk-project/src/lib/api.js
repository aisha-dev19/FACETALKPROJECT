const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
export async function api(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method: options.method ?? "GET",
            credentials: "include", // sends and receives the login cookie
            headers: options.body ? { "Content-Type": "application/json" } : undefined,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    }
    catch {
        throw new ApiError("Could not reach the server. Please check your connection and try again.", 0);
    }
    let data = null;
    try {
        data = await response.json();
    }
    catch {
        // the response had no body
    }
    if (!response.ok) {
        const message = data?.message ??
            "Something went wrong. Please try again.";
        throw new ApiError(message, response.status);
    }
    return data;
}
