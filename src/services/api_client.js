/**
 * Provide an axios client defining any configurations consistently used when communicating with an opencost server.
 *
 * We should use this client when performing XHR requests across the application, rather than using `fetch` or `axios` directly.
 */
import axios from "axios";

let baseURL = process.env.BASE_URL || "{PLACEHOLDER_BASE_URL}";
if (baseURL.includes("PLACEHOLDER_BASE_URL")) {
  baseURL = "http://localhost:9090";
}

const client = axios.create({ baseURL });

export default client;
