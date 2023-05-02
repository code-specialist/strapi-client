import { strapiClient } from "@/strapiLib/strapiClient";
import { StrapiBaseDataType, StrapiType } from "@/strapiLib/entities";
import type { NextApiRequest, NextApiResponse } from "next";

export interface IAuthor extends StrapiBaseDataType {
	name: string;
	slug: string;
	hexColor: string;
}

export class CategoryEntity extends StrapiType<IAuthor> {
	constructor() {
		super("categories", strapiClient);
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "GET") {
		const categoryEntity = new CategoryEntity();
		if (req.query.id) {
			return res.status(200).json(await categoryEntity.get(req.query.id));
		}
		return res.status(200).json(await categoryEntity.getAll());
	}
}
