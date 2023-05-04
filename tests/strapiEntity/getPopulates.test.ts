import axios from "axios";
import { StrapiEntity } from "../../lib/strapiEntity";


describe("StrapiEntity", () => {
	describe("getPopulates", () => {
		it("should return an empty object if no child entities are defined", () => {
			const strapiEntity = new StrapiEntity({
				client: axios.create(),
				path: "/articles",
			});
			expect(strapiEntity["getPopulates"]()).toEqual({});
		});

		it("should return an object with the child entities joined by comma if child entities are defined", () => {
			const strapiEntity = new StrapiEntity({
				client: axios.create(),
				path: "/articles",
				childEntities: ["author", "comments"],
			});
			expect(strapiEntity["getPopulates"]()).toEqual({
				populate: "author,comments",
			});
		});
	});
});
