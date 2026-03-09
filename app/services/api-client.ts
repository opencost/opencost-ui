import axios from "axios";

const client = axios.create({ baseURL:'https://demo.infra.opencost.io/model' });

export default client;
