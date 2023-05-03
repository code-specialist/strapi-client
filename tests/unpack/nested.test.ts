import axios, { AxiosInstance } from "axios";
import { StrapiEntity } from "../../lib/strapiEntity";
const testClient = axios.create() as AxiosInstance;

interface TestEntity {
	id: number;
	name: string;
	subEntity: {
		id: number;
		name: string;
		subSubEntity: {
			id: number;
			name: string;
		};
		subSubEntityList: [
			{
				id: number;
				name: string;
			},
			{
				id: number;
				name: string;
			},
		];
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
					subSubEntity: {
						data: {
							id: 3,
							attributes: {
								name: "Test Sub Sub Entity",
							},
						},
					},
					subSubEntityList: {
						data: [
							{
								id: 4,
								attributes: {
									name: "Test Sub Sub Entity 1",
								},
							},
							{
								id: 5,
								attributes: {
									name: "Test Sub Sub Entity 2",
								},
							},
						],
					},
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
		subSubEntity: {
			id: 3,
			name: "Test Sub Sub Entity",
		},
		subSubEntityList: [
			{
				id: 4,
				name: "Test Sub Sub Entity 1",
			},
			{
				id: 5,
				name: "Test Sub Sub Entity 2",
			},
		],
	},
};

describe("StrapiEntity.unpackEntity", () => {
	let strapiEntity: StrapiEntity<TestEntity>;

	beforeAll(() => {
		strapiEntity = new StrapiEntity<TestEntity>({
			client: testClient,
			path: "testPath",
			childEntities: [
				"subEntity",
				"subEntity.subSubEntity",
				"subEntity.subSubEntityList",
			],
		});
	});

	it("should be able to unpack a nested datastructure successfully", async () => {
		const result = await strapiEntity["unpackEntity"](input);
        console.log(result)
		expect(result).toEqual(expectedOutput);
	});
});
