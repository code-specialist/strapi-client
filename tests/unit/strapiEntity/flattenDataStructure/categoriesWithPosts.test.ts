import axios, { AxiosInstance } from "axios";

import { response as categoriesWithPosts } from "./data/categoriesWithPosts";
import { StrapiEntity } from "../../../../lib/strapiEntity";

const testClient = axios.create() as AxiosInstance;
describe("StrapiEntity.unpackEntity", () => {
	let strapiEntity: StrapiEntity<any>;

	beforeAll(() => {
		strapiEntity = new StrapiEntity<any>({
			client: testClient,
			path: "_",
		});
	});

	it("should be able to unpack a simple data structure", async () => {
		const result = strapiEntity["flattenDataStructure"](categoriesWithPosts);
		// TODO: Add assertions
	});
});
