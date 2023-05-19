import { StrapiEntity } from "../../lib/strapiEntity";

// Mock AxiosInstance and response data for testing
const mockClient = {
	get: jest.fn(),
};


describe("getAll", () => {
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(() => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });
	});

	it("should fetch all data from Strapi with pagination", async () => {
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

		const result = await entity.getAll();

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

		expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
	});

	it("should fetch all data from Strapi without pagination", async () => {
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
		const result = await entity.getAll();

		// Assert
		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 1,
			},
		});

		expect(result).toEqual([{ id: 1 }, { id: 2 }]);
	});

	it("should return empty array when no data is available", async () => {
		// Arrange
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					metadata: {
						pagination: {
							page: 1,
							pageCount: 0,
						},
					},
					data: [],
				},
			}),
		);

		// Act
		const result = await entity.getAll();

		// Assert
		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 1,
			},
		});

		expect(result).toEqual([]);
	});
});
