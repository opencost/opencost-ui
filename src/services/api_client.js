/**
 * Provide an axios client defining any configurations consistently used when communicating with an opencost server.
 *
 * We should use this client when performing XHR requests across the application, rather than using `fetch` or `axios` directly.
 */
import axios from "axios";

let baseURL = process.env.BASE_URL || "{PLACEHOLDER_BASE_URL}";

// In production/Netlify, use the /api proxy to avoid CORS issues
// In development (localhost), use the demo server directly
if (!baseURL || baseURL.includes("PLACEHOLDER_BASE_URL")) {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    // Production: use Netlify proxy
    baseURL = "/api";
  } else {
    // Development: use demo server directly
    baseURL = "https://demo.infra.opencost.io";
  }
}

console.log("[api_client] Using baseURL:", baseURL);

const client = axios.create({ baseURL });

export default client;
