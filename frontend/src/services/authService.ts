import axios from "axios";
import { api } from "./api";
import type { ApiEnvelope } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  storageLimit: number;
  usedStorage: number;
  createdAt: string;
  updatedAt: string;
};

const extractError = (err: unknown, fallback: string): Error => {
  if (axios.isAxiosError(err)) {
    const message =
      (err.response?.data as ApiEnvelope | undefined)?.message ||
      err.message ||
      fallback;
    return new Error(message);
  }
  return err instanceof Error ? err : new Error(fallback);
};

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthUser> {
    try {
      const res = await api.post<ApiEnvelope<AuthUser>>("/auth/register", {
        name,
        email,
        password,
      });
      // Register returns the user directly under data.
      return res.data.data as AuthUser;
    } catch (err) {
      throw extractError(err, "Failed to register");
    }
  },

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const res = await api.post<ApiEnvelope<{ user: AuthUser }>>(
        "/auth/login",
        { email, password },
      );
      return res.data.data!.user;
    } catch (err) {
      throw extractError(err, "Invalid email or password");
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      throw extractError(err, "Failed to log out");
    }
  },

  async me(): Promise<AuthUser | null> {
    try {
      const res = await api.get<ApiEnvelope<{ user: AuthUser }>>("/auth/me");
      return res.data.data?.user ?? null;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        return null;
      }
      throw extractError(err, "Failed to fetch current user");
    }
  },
};
