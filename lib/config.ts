export const config = {
    endpoint: process.env.STRAPI_ENDPOINT,
    apiKey: process.env.STRAPI_API_KEY,
    timeout: Number(process.env.STRAPI_TIMEOUT) || 10000,
}