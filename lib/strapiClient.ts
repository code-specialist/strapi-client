import axios, { CreateAxiosDefaults } from 'axios'

interface ICreateStrapiClient {
	baseUrl: string
	apiKey: string
	timeout?: number
	additionalConfig?: CreateAxiosDefaults<any>
}

export function createStrapiClient({ baseUrl, apiKey, timeout, additionalConfig }: ICreateStrapiClient) {
	// TODO: There are possible merge conflicts with the additionalConfig e.g. headers
	return axios.create({
		baseURL: `${baseUrl}/api`,
		timeout: timeout,
		headers: {
			Authorization: `Bearer ${apiKey}`
		},
		...additionalConfig
	})
}
