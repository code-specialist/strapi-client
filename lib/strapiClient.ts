import axios from "axios";
import { config } from "./config";

if (!config.base_url) {
	throw new Error("STRAPI_ENDPOINT is not defined");
}
if (!config.apiKey) {
	throw new Error("STRAPI_API_KEY is not defined");
}

export const strapiClient = axios.create({
	baseURL: `${config.base_url}/api`,
	timeout: config.timeout,
	headers: {
		Authorization: `Bearer ${config.apiKey}`,
	},
});