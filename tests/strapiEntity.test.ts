import axios, { AxiosInstance } from "axios";
import { StrapiEntity } from "../lib/strapiEntity";

interface TestEntity {
	id: number;
	name: string;
}

interface GenericStrapiEntity {
	id: number;
	attributes: any;
}

interface TestAttributes {
	name: string;
}

const testClient = axios.create() as AxiosInstance;
const testPath = "testPath";

const testEntity = {
	id: 1,
	attributes: {
		name: "Test Entity",
	},
};

const testChildEntity = {
	data: {
		id: 1,
		attributes: {
			name: "Test Child Entity",
		},
	},
};

const testResponse = {
	data: [testEntity],
};

const testChildEntityResponse = {
	data: testChildEntity,
};

describe("StrapiEntity", () => {
	let strapiEntity: StrapiEntity<TestEntity>;

	beforeEach(() => {
		strapiEntity = new StrapiEntity<TestEntity>({
			client: testClient,
			path: testPath,
		});
	});

	describe("getAll", () => {
		it.skip("should call the client's get method with the correct parameters", async () => {
			const getSpy = jest
				.spyOn(testClient, "get")
				.mockResolvedValue(testResponse);
			await strapiEntity.getAll();
			expect(getSpy).toHaveBeenCalledWith(testPath, { params: {} });
		});

		it.skip("should unpack the response into an array of entities", async () => {
			jest.spyOn(testClient, "get").mockResolvedValue(testResponse);
			const result = await strapiEntity.getAll();
			expect(result).toEqual([{ id: 1, name: "Test Entity" }]);
		});
	});

	describe("findOneBy", () => {
		it.skip("should call the client's get method with the correct parameters", async () => {
			const getSpy = jest
				.spyOn(testClient, "get")
				.mockResolvedValue(testResponse);
			await strapiEntity.findOneBy({ fieldName: "name", value: "Test Entity" });
			expect(getSpy).toHaveBeenCalledWith(testPath, {
				params: {
					filters: { "[name]": "Test Entity" },
				},
			});
		});

		it.skip("should unpack the response into an entity", async () => {
			jest.spyOn(testClient, "get").mockResolvedValue(testResponse);
			const result = await strapiEntity.findOneBy({
				fieldName: "name",
				value: "Test Entity",
			});
			expect(result).toEqual({ id: 1, name: "Test Entity" });
		});
	});

	describe("findAllBy", () => {
		it.skip("should call the client's get method with the correct parameters", async () => {
			const getSpy = jest
				.spyOn(testClient, "get")
				.mockResolvedValue(testResponse);
			await strapiEntity.findAllBy({ fieldName: "name", value: "Test Entity" });
			expect(getSpy).toHaveBeenCalledWith(testPath, {
				params: {
					populate: undefined,
					filters: { "[name]": "Test Entity" },
				},
			});
		});

		it.skip("should unpack the response into an array of entities", async () => {
			jest.spyOn(testClient, "get").mockResolvedValue(testResponse);
			const result = await strapiEntity.findAllBy({
				fieldName: "name",
				value: "Test Entity",
			});
			expect(result).toEqual([{ id: 1, name: "Test Entity" }]);
		});
	});
});

describe("StrapiEntity", () => {
	let axiosInstance: AxiosInstance;
	let strapiEntity: StrapiEntity<any>;

	beforeEach(() => {
		strapiEntity = new StrapiEntity({
			client: testClient,
			path: "/test",
			childEntities: ["child"],
		});
	});

	describe("unpackEntity", () => {
		it("should unpack simple entity", () => {
			const entity: GenericStrapiEntity = {
				id: 1,
				attributes: {
					name: "Test Entity",
				},
			};
			const result = strapiEntity["unpackEntity"](entity);
			expect(result).toEqual({
                child: null,
				id: 1,
				name: "Test Entity",
			});
		});

		it("should unpack entity with child entity", () => {
			const entity: GenericStrapiEntity = {
				id: 1,
				attributes: {
					name: "Test Entity",
					child: {
						data: {
							id: 2,
							attributes: {
								name: "Child Entity",
							},
						},
					},
				},
			};
			const result = strapiEntity["unpackEntity"](entity);
			expect(result).toEqual({
				id: 1,
				name: "Test Entity",
				child: {
					id: 2,
					name: "Child Entity",
				},
			});
		});
	});

	describe("getPopulates", () => {
		it("should return the child population", () => {
			const result = strapiEntity["getPopulates"]();
			expect(result).toEqual({ populate: "child" });
		});

		it("should return populated object when child entities", () => {
			strapiEntity = new StrapiEntity({
				client: axiosInstance,
				path: "/test",
				childEntities: ["child", "grandchild"],
			});
			const result = strapiEntity["getPopulates"]();
			expect(result).toEqual({ populate: "child,grandchild" });
		});
	});

	describe("getFilter", () => {
		it("should return filter object when valid fieldName", () => {
			const result = strapiEntity["getFilter"]("name", "test");
			expect(result).toEqual({ "filters[name]": "test" });
		});

		it("should return filter object when valid fieldName with nested path", () => {
			const result = strapiEntity["getFilter"]("parent.child.name", "test");
			expect(result).toEqual({
				"filters[parent][child][name]": "test",
			});
		});
	});

	// describe("find", () => {
});

describe("StrapiEntity", () => {
	describe("get method", () => {
		it("should return the correct entity with child entities", async () => {
			const client = testClient;
			const path = "testPath";
			const childEntities = ["category", "author"];
			const entity = {
				id: 1,
				attributes: {
					title: "Test Entity",
					description: "This is a test entity",
					category: {
						data: {
							id: 1,
							attributes: {
								name: "Test Category",
							},
						},
					},
					author: {
						data: {
							id: 1,
							attributes: {
								name: "Test Author",
							},
						},
					},
				},
			};
			const expectedEntity = {
				id: 1,
				title: "Test Entity",
				description: "This is a test entity",
				category: {
					id: 1,
					name: "Test Category",
				},
				author: {
					id: 1,
					name: "Test Author",
				},
			};

			const mockedGet = jest.fn().mockResolvedValue({ data: { data: entity } });
			client.get = mockedGet;

			const strapiEntity = new StrapiEntity<typeof expectedEntity>({
				client,
				path,
				childEntities,
			});

			const result = await strapiEntity.get({ id: 1 });

			expect(result).toEqual(expectedEntity);
			expect(mockedGet).toHaveBeenCalledWith(`${path}/1`, {
				params: { populate: childEntities.join(",") },
			});
		});

		it("should return the correct entity without child entities", async () => {
			const client = axios.create();
			const path = "testPath";
			const entity = {
				id: 1,
				attributes: {
					title: "Test Entity",
					description: "This is a test entity",
				},
			};
			const expectedEntity = {
				id: 1,
				title: "Test Entity",
				description: "This is a test entity",
			};

			const mockedGet = jest.fn().mockResolvedValue({ data: { data: entity } });
			client.get = mockedGet;

			const strapiEntity = new StrapiEntity<typeof expectedEntity>({
				client,
				path,
			});

			const result = await strapiEntity.get({ id: 1 });

			expect(result).toEqual(expectedEntity);
			expect(mockedGet).toHaveBeenCalledWith(`${path}/1`, { params: {} });
		});
	});
});
