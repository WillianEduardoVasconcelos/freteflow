const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type ApiError = {
  error: string;
  fields?: Array<{ path: string; message: string }>;
};

function readCookie(name: string) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}

export function getCsrfToken() {
  return readCookie("freteflow_csrf");
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken && path.startsWith("/api/auth/")) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiError
    | null;

  if (!response.ok) {
    throw {
      status: response.status,
      ...(payload ?? { error: "Não foi possível completar a requisição" }),
    } as ApiError & { status: number };
  }

  return payload as T;
}
