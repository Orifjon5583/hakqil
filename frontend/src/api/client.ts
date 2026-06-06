const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export function getToken() {
  return localStorage.getItem("robbit_token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.error === "string") message = body.error;
      if (Array.isArray(body?.details) && body.details[0]?.message) {
        message = body.details[0].message;
      }
    } catch {
      // Keep the status-based message when the response is not JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
