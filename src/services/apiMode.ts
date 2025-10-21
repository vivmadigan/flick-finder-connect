export const API_MODE = (import.meta.env.VITE_API_MODE ?? "mock") as "mock" | "live";
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7119";
export const TOKEN_KEY = "access_token";
