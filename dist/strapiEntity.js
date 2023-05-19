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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrapiEntity = void 0;
var StrapiEntity = /** @class */ (function () {
    function StrapiEntity(strapiEntity, pageSize) {
        this.client = strapiEntity.client;
        this.path = strapiEntity.path;
        this.childEntities = strapiEntity.childEntities;
        this.pageSize = pageSize !== null && pageSize !== void 0 ? pageSize : 25; // Defaults to 25
    }
    StrapiEntity.prototype.flattenDataStructure = function (data) {
        var _this = this;
        if (!data) {
            return null;
        }
        // rome-ignore lint/suspicious/noPrototypeBuiltins:
        if (data.hasOwnProperty("data")) {
            data = data.data;
        }
        if (!data) {
            return null;
        }
        // rome-ignore lint/suspicious/noPrototypeBuiltins:
        if (data.hasOwnProperty("attributes")) {
            var attributes = data.attributes, rest = __rest(data, ["attributes"]);
            data = __assign(__assign({}, rest), attributes);
        }
        for (var key in data) {
            if (Array.isArray(data[key])) {
                data[key] = data[key].map(function (item) {
                    return _this.flattenDataStructure(item);
                });
            }
            else if (typeof data[key] === "object") {
                data[key] = this.flattenDataStructure(data[key]);
            }
        }
        return data;
    };
    StrapiEntity.prototype.getPopulates = function () {
        return this.childEntities ? { populate: this.childEntities.join(",") } : {};
    };
    StrapiEntity.prototype.getFilter = function (fieldName, value) {
        var _a;
        return _a = {}, _a["filters[".concat(fieldName, "]")] = value, _a;
    };
    StrapiEntity.prototype.queryStrapi = function (_a) {
        var _b, _c;
        var path = _a.path, populates = _a.populates, filters = _a.filters, _d = _a.page, page = _d === void 0 ? 1 : _d;
        return __awaiter(this, void 0, void 0, function () {
            var response, additionalData;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.client.get(path ? path : this.path, {
                            params: __assign(__assign(__assign({}, (populates !== null && populates !== void 0 ? populates : {})), (filters !== null && filters !== void 0 ? filters : {})), { "pagination[pageSize]": this.pageSize, "pagination[page]": page }),
                        })];
                    case 1:
                        response = _e.sent();
                        if (!(((_c = (_b = response.data.metadata) === null || _b === void 0 ? void 0 : _b.pagination) === null || _c === void 0 ? void 0 : _c.pageCount) > page)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.queryStrapi({
                                path: path,
                                populates: populates,
                                filters: filters,
                                page: page + 1,
                            })];
                    case 2:
                        additionalData = _e.sent();
                        response.data.data = __spreadArray(__spreadArray([], response.data.data, true), additionalData.data, true);
                        return [2 /*return*/, response.data];
                    case 3: return [2 /*return*/, response.data];
                }
            });
        });
    };
    StrapiEntity.prototype.find = function (fieldName, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.queryStrapi({
                        populates: this.getPopulates(),
                        filters: this.getFilter(fieldName, value),
                    })];
            });
        });
    };
    StrapiEntity.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queryStrapi(this.getPopulates())];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.flattenDataStructure(response.data)];
                }
            });
        });
    };
    StrapiEntity.prototype.findOneBy = function (_a) {
        var fieldName = _a.fieldName, value = _a.value;
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.findAllBy({ fieldName: fieldName, value: value })];
                    case 1:
                        data = _b.sent();
                        return [2 /*return*/, data[0]];
                }
            });
        });
    };
    StrapiEntity.prototype.findAllBy = function (_a) {
        var fieldName = _a.fieldName, value = _a.value;
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.find(fieldName, value)];
                    case 1:
                        data = _b.sent();
                        return [2 /*return*/, this.flattenDataStructure(data)];
                }
            });
        });
    };
    StrapiEntity.prototype.get = function (_a) {
        var id = _a.id;
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.queryStrapi({
                            path: "".concat(this.path, "/").concat(id),
                            populates: this.getPopulates(),
                        })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, this.flattenDataStructure(response.data)];
                }
            });
        });
    };
    return StrapiEntity;
}());
exports.StrapiEntity = StrapiEntity;
