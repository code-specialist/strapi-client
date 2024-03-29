import axios, { AxiosInstance } from "axios";
import { StrapiEntity } from "../../../lib/strapiEntity";

describe("StrapiEntity", () => {
	let client: AxiosInstance;
	let entity: StrapiEntity<any>;

	beforeEach(() => {
		client = axios.create();
		entity = new StrapiEntity({
			client,
			path: "/test",
		});
	});

	describe("find", () => {
		const responseData = {
			data: [
				{
					id: 1,
					name: "John",
					email: "john@example.com",
				},
				{
					id: 2,
					name: "Mary",
					email: "mary@example.com",
				},
			],
		};

		it("should return an array of entities matching the specified filter", async () => {
			jest.spyOn(client, "get").mockResolvedValueOnce({ data: responseData });
			const result = await entity["find"]("name", "John");

			expect(client.get).toHaveBeenCalledWith("/test", {
				params: {
					populate: undefined,
					"pagination[pageSize]": 25,
					"pagination[page]": 1,
					"filters[name]": "John",
					publicationState: "live"
				},
			});

			expect(result).toEqual(responseData);
		});

		it("should build a correct filter when multiple values are provided", async () => {
			jest.spyOn(client, "get").mockResolvedValueOnce({ data: { data: [] } });

			await entity["find"](["name", "test"], "John");

			expect(client.get).toHaveBeenCalledWith("/test", {
				params: {
					populate: undefined,
					"pagination[pageSize]": 25,
					"pagination[page]": 1,
					"filters[name][test]": "John",
					publicationState: "live"
				},
			});
		});

		it("should return an empty array if no entities match the specified filter", async () => {
			jest.spyOn(client, "get").mockResolvedValueOnce({ data: { data: [] } });

			const result = await entity["find"]("name", "Nonexistent");

			expect(client.get).toHaveBeenCalledWith("/test", {
				params: {
					populate: undefined,
					"pagination[pageSize]": 25,
					"pagination[page]": 1,
					"filters[name]": "Nonexistent",
					publicationState: "live"
				},
			});

			expect(result).toEqual({ data: [] });
		});
	});
});
