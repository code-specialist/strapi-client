import { StrapiEntity } from "../../../../lib/strapiEntity";
import { IStrapiEntity } from "../../../../lib/strapiTypes";

describe("flattenDataStructure", () => {
	it("returns null for null input", () => {
		const result = new StrapiEntity({} as IStrapiEntity)[
			"flattenDataStructure"
		](null);
		expect(result).toBeNull();
	});

	it("flattens attributes into root object", () => {
		const input = {
			id: 1,
			type: "post",
			attributes: { title: "Hello", body: "World" },
		};
		const expectedOutput = {
			id: 1,
			type: "post",
			title: "Hello",
			body: "World",
		};
		const result = new StrapiEntity({} as IStrapiEntity)[
			"flattenDataStructure"
		](input);
		expect(result).toEqual(expectedOutput);
	});

	it("recursively flattens child objects", () => {
		const input = {
			id: 1,
			type: "post",
			attributes: {
				title: "Hello",
				author: { name: "John Doe", email: "john@example.com" },
				comments: [
					{ id: 1, body: "Great post!" },
					{ id: 2, body: "Thanks for sharing!" },
				],
			},
		};
		const expectedOutput = {
			id: 1,
			type: "post",
			title: "Hello",
			author: { name: "John Doe", email: "john@example.com" },
			comments: [
				{ id: 1, body: "Great post!" },
				{ id: 2, body: "Thanks for sharing!" },
			],
		};
		const result = new StrapiEntity({} as IStrapiEntity)[
			"flattenDataStructure"
		](input);
		expect(result).toEqual(expectedOutput);
	});
});
