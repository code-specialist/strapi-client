import { strapiClient } from "@/strapiLib/strapiClient";
import {
	StrapiBaseDataType,
	StrapiBaseImageType,
	StrapiType,
} from "@/strapiLib/entities";
import type { NextApiRequest, NextApiResponse } from "next";
import { IAuthor } from "./authors";

export interface IPost extends StrapiBaseDataType {
	title: string;
	slug: string;
	content: string;
	publishDate: string;
	excerpt: string;
	image?: StrapiBaseImageType;
	author: IAuthor;
}

export class PostEntity extends StrapiType<IPost> {
	constructor() {
		super("posts", strapiClient, ["image", "author", "author.image"]);
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const postEntity = new PostEntity();
	if (req.method === "GET") {
		if (req.query.id) {
			return res.status(200).json(await postEntity.get(req.query.id));
		}
		if (req.query.slug){
			return res.status(200).json(await postEntity.findOneBy("slug", req.query.slug));
		}
		return res.status(200).json(await postEntity.getAll());
	}
}
