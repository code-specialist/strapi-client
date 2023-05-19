import axios, { AxiosInstance } from "axios";
import { StrapiEntity } from "../../../lib/strapiEntity";
import { response as categoriesWithPosts } from "./data/categoriesWithPosts";

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
