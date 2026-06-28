import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_API_URL || "/model";

const client = axios.create({ baseURL });

let getAccessToken: (() => Promise<string | undefined>) | null = null;

/** Called from AuthProvider; clears when unmounting or in bypass mode. */
export function registerApiAuthGetter(
  getter: (() => Promise<string | undefined>) | null,
) {
  getAccessToken = getter;
}

client.interceptors.request.use(async (config) => {
  if (!getAccessToken) return config;
  if (config.headers?.Authorization) return config;
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* not logged in or silent renewal failed */
  }
  return config;
});

export default client;
