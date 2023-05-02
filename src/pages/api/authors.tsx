import { strapiClient } from "@/strapiLib/strapiClient";
import {
	StrapiBaseDataType,
	StrapiBaseImageType,
	StrapiType,
} from "@/strapiLib/entities";
import type { NextApiRequest, NextApiResponse } from "next";

export interface IAuthor extends StrapiBaseDataType {
	name: string;
	slug: string;
	image: StrapiBaseImageType;
}

export class AuthorEntity extends StrapiType<IAuthor> {
	constructor() {
		super("authors", strapiClient, ["image"]);
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "GET") {
		const authorEntity = new AuthorEntity();
		if (req.query.id) {
			return res.status(200).json(await authorEntity.get(req.query.id));
		}
		return res.status(200).json(await authorEntity.getAll());
	}
}
