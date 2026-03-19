import axios from "axios";

function resolveBaseURL(): string {
  // Primary: explicit configuration via Vite env
  const viteBase = import.meta.env.VITE_BASE_API_URL as string | undefined;
  if (viteBase && viteBase.trim() !== "") {
    return viteBase;
  }

  // Secondary: fall back to a legacy-style BASE_URL if exposed at build time
  const legacyBase = (import.meta.env.BASE_URL as string | undefined) ?? "";
  if (legacyBase && legacyBase.trim() !== "") {
    return legacyBase;
  }

  // Fallback: local opencost instance commonly used in development
  return "http://localhost:9090";
}

const client = axios.create({ baseURL: resolveBaseURL() });

export default client;
