import { StrapiEntity } from "../../../lib/strapiEntity";

// Mock AxiosInstance and response data for testing
const mockClient = {
	get: jest.fn(),
};

describe("queryStrapi", () => {
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should respect custom page sizes", async () => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" }, { pageSize: 50 });

		// Mock response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					meta: {
						pagination: {
							page: 1,
							pageCount: 1,
						},
					},
					data: [],
				},
			}),
		);


		await entity["queryStrapi"]({});

		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 50,
				"pagination[page]": 1,
				publicationState: "live"
			},
		});
	});

	it("should reflect the fetchPreviews boolean", async () => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" }, { fetchPreviews: true });

		// Mock response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					meta: {
						pagination: {
							page: 1,
							pageCount: 1,
						},
					},
					data: [],
				},
			}),
		);


		await entity["queryStrapi"]({});

		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 1,
				publicationState: "preview"
			},
		});
	});

	it("should fetch data from Strapi with pagination", async () => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });

		// Mock first response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					meta: {
						pagination: {
							page: 1,
							pageCount: 2,
						},
					},
					data: [{ id: 1 }, { id: 2 }],
				},
			}),
		);

		// Mock second response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					meta: {
						pagination: {
							page: 2,
							pageCount: 2,
						},
					},
					data: [{ id: 3 }, { id: 4 }],
				},
			}),
		);

		const result = await entity["queryStrapi"]({});

		expect(mockClient.get).toHaveBeenCalledTimes(2); // Two requests made due to pagination
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 1,

				publicationState: "live"
			},
		});
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 2,

				publicationState: "live"
			},
		});

		expect(result.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
		expect(result.meta?.pagination?.pageCount).toBe(2);
	});

	it("should fetch data from Strapi without pagination", async () => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });

		// Arrange
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					meta: {
						pagination: {
							page: 1,
							pageCount: 1,
						},
					},
					data: [{ id: 1 }, { id: 2 }],
				},
			}),
		);

		// Act
		const result = await entity["queryStrapi"]({});

		// Assert
		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 1,

				publicationState: "live"
			},
		});

		expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
	});

	it("should add the populates and filters", async () => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });

		// Arrange
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					meta: {
						pagination: {
							page: 1,
							pageCount: 1,
						},
					},
					data: [{ id: 1 }, { id: 2 }],
				},
			}),
		);

		// @ts-ignore
		entity = new StrapiEntity({
			// @ts-ignore
			client: mockClient,
			path: "/test",
			childEntities: ["test", "test2", "someOtherAttribute", "root.nested"],
		});

		// Act
		const populates = entity["getPopulates"]();
		const filters = entity["getFilter"]("test", "test");
		const result = await entity["queryStrapi"]({
			populates: populates,
			filters: filters,
		});

		// Assert
		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				populate: "test,test2,someOtherAttribute,root.nested",
				"filters[test]": "test",
				"pagination[pageSize]": 25,
				"pagination[page]": 1,
				publicationState: "live"
			},
		});

		expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
	});
});
