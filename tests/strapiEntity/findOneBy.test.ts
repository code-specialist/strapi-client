import { StrapiEntity } from "../../lib/strapiEntity";

// Mock AxiosInstance and response data for testing
const mockClient = {
	get: jest.fn(),
};

describe("findOneBy", () => {
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(() => {
		// @ts-ignore
		entity = new StrapiEntity({ client: mockClient, path: "/test" });
	});

	it("should fetch data from Strapi and return the first result", async () => {
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
					data: [{ id: 1 }, { id: 2 }],
				},
			}),
		);

		const result = await entity.findOneBy({ fieldName: "id", value: "1" });

		expect(mockClient.get).toHaveBeenCalledTimes(1); // Only one request made
		expect(mockClient.get).toHaveBeenCalledWith("/test", {
			params: {
				"filters[id]": "1",
				"pagination[pageSize]": 25,
				"pagination[page]": 1,
			},
		});

		expect(result).toEqual({ id: 1 });
	});
});
