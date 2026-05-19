import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Shared axios instance.
 *  - withCredentials: true so the browser sends/receives the JWT HTTP-only cookie.
 *  - Centralised here so every feature uses the same config.
 */
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};
