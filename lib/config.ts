// TODO: More explicit and injectable config?
export const config = {
    base_url: process.env.STRAPI_BASE_URL,
    apiKey: process.env.STRAPI_API_KEY,
    timeout: Number(process.env.STRAPI_TIMEOUT) || 10000,
}