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

  if (!response.ok) throw new Error(`API error ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
