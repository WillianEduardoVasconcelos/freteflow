import { create } from "zustand";
import { apiRequest, getAccessToken, setAccessToken } from "../api/client";

type User = {
  id: number;
  nome: string;
  email: string;
  perfil: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
  login: (email: string, senha: string, codigo2fa?: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
};

type LoginResponse = {
  accessToken: string;
  user: User;
};

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "error" in error) {
    return String(error.error);
  }
  return "Não foi possível comunicar com a API.";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  requiresTwoFactor: false,

  login: async (email, senha, codigo2fa) => {
    set({ loading: true, error: null });

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          senha,
          ...(codigo2fa ? { codigo2fa } : {}),
        }),
      });
      setAccessToken(response.accessToken);
      set({
        user: response.user,
        loading: false,
        requiresTwoFactor: false,
      });
      return true;
    } catch (error) {
      const message = errorMessage(error);
      set({
        loading: false,
        error: message,
        requiresTwoFactor: message.toLowerCase().includes("2fa"),
      });
      return false;
    }
  },

  refresh: async () => {
    try {
      const response = await apiRequest<{ accessToken: string }>(
        "/api/auth/refresh",
        {
          method: "POST",
        },
      );
      setAccessToken(response.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      set({ user: null });
      return false;
    }
  },

  logout: async () => {
    try {
      if (getAccessToken()) {
        await apiRequest<void>("/api/auth/logout", { method: "POST" });
      }
    } finally {
      setAccessToken(null);
      set({ user: null, requiresTwoFactor: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
