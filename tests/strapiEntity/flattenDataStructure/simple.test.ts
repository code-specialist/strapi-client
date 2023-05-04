import axios, { AxiosInstance } from "axios";
import { StrapiEntity } from "../../../lib/strapiEntity";
const testClient = axios.create() as AxiosInstance;

interface TestEntity {
	id: number;
	name: string;
	subEntity: {
		id: number;
		name: string;
	};
}

const input = {
	id: 1,
	attributes: {
		name: "Test Entity",
		subEntity: {
			data: {
				id: 2,
				attributes: {
					name: "Test Sub Entity",
				},
			},
		},
	},
};

const expectedOutput: TestEntity = {
	id: 1,
	name: "Test Entity",
	subEntity: {
		id: 2,
		name: "Test Sub Entity",
	},
};

describe("StrapiEntity.unpackEntity", () => {
	let strapiEntity: StrapiEntity<TestEntity>;

	beforeAll(() => {
		strapiEntity = new StrapiEntity<TestEntity>({
			client: testClient,
			path: "_",
			childEntities: ["subEntity"]
		});
	});

	it("should be able to unpack a simple data structure", async () => {
		const result = strapiEntity["flattenDataStructure"](input);
		expect(result).toEqual(expectedOutput);
	});
});
