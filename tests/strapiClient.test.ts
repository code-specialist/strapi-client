import axios from "axios";
import { createStrapiClient } from "../lib/strapiClient";

describe("createStrapiClient", () => {
	const baseUrl = "https://example.com";
	const apiKey = "secret-key";

	it("creates an axios instance with the correct authorization header", () => {
		const client = createStrapiClient({ baseUrl, apiKey });

		expect(client.defaults.headers.Authorization).toEqual(`Bearer ${apiKey}`);
	});

	it("creates an axios instance with the correct base URL", () => {
		const client = createStrapiClient({ baseUrl, apiKey });

		expect(client.defaults.baseURL).toEqual(`${baseUrl}/api`);
	});

	it("creates an axios instance with the provided timeout value", () => {
		const timeout = 5000;
		const client = createStrapiClient({ baseUrl, apiKey, timeout });

		expect(client.defaults.timeout).toEqual(timeout);
	});

	it("creates an axios instance with additional configuration options", () => {
		const additionalConfig = {
			withCredentials: true,
			xsrfCookieName: "XSRF-TOKEN",
		};
		const client = createStrapiClient({ baseUrl, apiKey, additionalConfig });

		expect(client.defaults.withCredentials).toEqual(true);
		expect(client.defaults.xsrfCookieName).toEqual("XSRF-TOKEN");
	});

	// TODO: This test is not working as expected. Fix it
	it.skip("returns an axios instance", () => {
		const client = createStrapiClient({ baseUrl, apiKey });
		
		expect(client).toBeInstanceOf(axios);
	});
});
