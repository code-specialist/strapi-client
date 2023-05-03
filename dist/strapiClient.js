"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strapiClient = void 0;
var axios_1 = __importDefault(require("axios"));
var config_1 = require("./config");
if (!config_1.config.endpoint) {
    throw new Error("STRAPI_ENDPOINT is not defined");
}
if (!config_1.config.apiKey) {
    throw new Error("STRAPI_API_KEY is not defined");
}
exports.strapiClient = axios_1.default.create({
    baseURL: "".concat(config_1.config.endpoint, "/api"),
    timeout: config_1.config.timeout,
    headers: {
        Authorization: "Bearer ".concat(config_1.config.apiKey),
    },
});
