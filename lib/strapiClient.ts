import axios from "axios";
import { config } from "./config";

if (!config.endpoint) {
	throw new Error("STRAPI_ENDPOINT is not defined");
}
if (!config.apiKey) {
	throw new Error("STRAPI_API_KEY is not defined");
}

export const strapiClient = axios.create({
	baseURL: `${config.endpoint}/api`,
	timeout: config.timeout,
	headers: {
		Authorization: `Bearer ${config.apiKey}`,
	},
});