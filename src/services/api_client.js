/**
 * Provide an axios client defining any configurations consistently used when communicating with an opencost server.
 */
import axios from "axios";

const client = axios.create();

export default client;