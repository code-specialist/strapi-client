"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStrapiClient = void 0;
var axios_1 = __importDefault(require("axios"));
function createStrapiClient(_a) {
    var baseUrl = _a.baseUrl, apiKey = _a.apiKey, timeout = _a.timeout, additionalConfig = _a.additionalConfig;
    // TODO: There are possible merge conflicts with the additionalConfig e.g. headers
    return axios_1.default.create(__assign({ baseURL: "".concat(baseUrl, "/api"), timeout: timeout, headers: {
            Authorization: "Bearer ".concat(apiKey),
        } }, additionalConfig));
}
exports.createStrapiClient = createStrapiClient;
