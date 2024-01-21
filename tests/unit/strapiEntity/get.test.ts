import { StrapiEntity } from "../../../lib/strapiEntity";

// Mock AxiosInstance and response data for testing
const mockClient = {
	get: jest.fn(),
};

describe("get", () => {
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should fetch data from Strapi by ID", async () => {
		// Mock response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					id: 1,
					name: "Test",
				},
			}),
		);

		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });
		const result = await entity.get({ id: 1 });

		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test/1", {
			params: {
				populate: undefined,
				"pagination[pageSize]": 25,
				"pagination[page]": 1,

				publicationState: "live"
			},
		});

		expect(result).toEqual({ id: 1, name: "Test" });
	});

	it("should fetch data from Strapi by ID with populates", async () => {
		// Arrange
		entity = new StrapiEntity({
			// @ts-ignore
			client: mockClient,
			path: "/test",
			childEntities: ["relation"],
		});

		// Mock response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: {
					id: 1,
					name: "Test",
					relation: {
						id: 2,
						name: "Related",
					},
				},
			}),
		);

		const result = await entity.get({ id: 1 });

		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test/1", {
			params: expect.objectContaining({
				populate: "relation",
			}),
		});

		expect(result).toEqual({
			id: 1,
			name: "Test",
			relation: { id: 2, name: "Related" },
		});
	});

	it("should return null when no matching result is found", async () => {
		// Mock response
		mockClient.get.mockImplementationOnce(() =>
			Promise.resolve({
				data: null,
			}),
		);

		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });
		const result = await entity.get({ id: 1 });

		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test/1", {
			params: {
				"pagination[pageSize]": 25,
				"pagination[page]": 1,
				publicationState: "live"
			},
		});

		expect(result).toBeNull();
	});
});
