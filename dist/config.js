"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// TODO: More explicit and injectable config?
exports.config = {
    endpoint: process.env.STRAPI_ENDPOINT,
    apiKey: process.env.STRAPI_API_KEY,
    timeout: Number(process.env.STRAPI_TIMEOUT) || 10000,
};
