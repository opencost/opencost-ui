import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_API_URL || "/model";

const client = axios.create({ baseURL });

export default client;
