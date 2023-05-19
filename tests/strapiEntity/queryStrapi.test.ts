import { StrapiEntity } from "../../lib/strapiEntity";

// Mock AxiosInstance and response data for testing
const mockClient = {
	get: jest.fn(),
};

describe("queryStrapi", () => {
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(() => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });
	});

	it("should fetch data from Strapi with pagination", async () => {
		// Mock first response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					metadata: {
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
					metadata: {
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
			},
		});
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 2,
			},
		});

		expect(result.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
		expect(result.metadata?.pagination?.pageCount).toBe(2);
	});

	it("should fetch data from Strapi without pagination", async () => {
		// Arrange
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					metadata: {
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
			},
		});

		expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
	});
});
