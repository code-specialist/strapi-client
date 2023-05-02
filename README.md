## Introduction

This is a sample project to demonstrate the use of a imaginary strap client package. The package currently offers two methods `getAll` and `get(id)`. It queries data and unpacks and
partially flattens the data structure e.g.:

```json
{
    "data": {
        "id": "1",
        "attributes": {
            "name": "John Doe",
            "email": "John@doedel.com",
            "image": {
                "data": {
                    ...
                }
            }
        },
        "createdAt": "2020-01-01T00:00:00.000Z",
        "updatedAt": "2020-01-01T00:00:00.000Z",
        "publishedAt": "2020-01-01T00:00:00.000Z"
    }
}
```

is unpacked to 

```json
{
    "id": "1",
    "type": "user",
    "name": "John Doe",
    "email": "John@doedel.com",
    "image": {
        ...
        },
    "createdAt": "2020-01-01T00:00:00.000Z",
    "updatedAt": "2020-01-01T00:00:00.000Z",
    "publishedAt": "2020-01-01T00:00:00.000Z"
    },
```

The major advantage is, that you only have to define a few lines of code to get a full-blown proxy for the strapi endpoints:

```ts
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
		return res.status(200).json(await postEntity.getAll());
	}
}
```

## Installation

```
npm i
```


## Usage

```
npm run dev
```
