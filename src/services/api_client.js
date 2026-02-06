/**
 * Provide an axios client defining any configurations consistently used when communicating with an opencost server.
 *
 * We should use this client when performing XHR requests across the application, rather than using `fetch` or `axios` directly.
 */
import axios from "axios";

let baseURL = process.env.BASE_URL || "{PLACEHOLDER_BASE_URL}";

// Fallback logic for when BASE_URL is not set
if (!baseURL || baseURL.includes("PLACEHOLDER_BASE_URL")) {
  // Default to demo server for local development
  baseURL = "https://demo.infra.opencost.io";
}

console.log("[api_client] Using baseURL:", baseURL);

const client = axios.create({ baseURL });

export default client;
