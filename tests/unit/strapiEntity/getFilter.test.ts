import axios, { AxiosInstance } from "axios";
import { StrapiEntity } from "../../../lib/strapiEntity";

describe("StrapiEntity", () => {
	let client: AxiosInstance;
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		client = axios.create();
		entity = new StrapiEntity({
			client,
			path: "/test",
		});
	});

	describe("getFilter", () => {
		it("should return the correct filter object for a flat field name", () => {
			const filter = entity["getFilter"]("name", "test");
			expect(filter).toEqual({ "filters[name]": "test" });
		});
	});
});
