export const API_URL = process.env.API_URL ?? 'http://localhost:4000';

// Server-side GET helper. Returns null on any failure (API down, DB not up yet,
// non-2xx) so pages can render a clean empty state instead of crashing.
export async function apiGet<T>(path: string, token?: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
