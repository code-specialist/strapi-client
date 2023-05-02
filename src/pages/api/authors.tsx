
import { strapiClient } from "@/strapiLib/strapiClient";
import { StrapiBaseDataType, StrapiBaseImageType, StrapiType } from "@/strapiLib/entities";
import type { NextApiRequest, NextApiResponse } from "next";

export interface IAuthor extends StrapiBaseDataType {
	name: string;
    slug: string;
	image: StrapiBaseImageType;
}

export class AuthorEntity extends StrapiType<IAuthor> {
	constructor() {
		super("authors", strapiClient);
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const authorEntity = new AuthorEntity();
	res.status(200).json(await authorEntity.find());
}
