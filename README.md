## Intro

TODO:
- What does it do
- What are the benefits
- How does it do it
- what are the limitations (e.g. no support for data attribute)

## Installation

```sh
npm install code-specialist-strapi-client
```

```sh
pnpm add code-specialist-strapi-client
```

```sh
yarn add code-specialist-strapi-client
```

## Feature Roadmap

- [x] Fetching single entities
- [x] Fetching multiple entities
- [x] Fetching entities with relations
- [x] Fetching entities with nested relations
- [x] Pagination support 
- [ ] Support attributes called `data` in entities


If you have any feature requests, please open an issue with the `enhancement` label or simply create a pull request.

## Usage

1. Create an interface for your entity that extends the `StrapiBaseDataType` interface
    ```ts
    import { StrapiBaseDataType, StrapiBaseImageType } from "@code-specialist/strapi-client";
    export interface IPost extends StrapiBaseDataType {
        title: string;
        slug: string;
        content: string;
        publishDate: string;
        excerpt: string;
        image?: StrapiBaseImageType;
        author: IAuthor;
    }
    ```
    You may find the `StrapiBaseImageType` useful for your interface if you want to use images in your entity.
2. Create a client
    ```ts
    import { createStrapiClient } from "code-specialist-strapi-client";

    const client = createStrapiClient({baseUrl: "https://cs.code-specialist.com", apiKey: "YOUR_API_KEY"});
    ```   

3. Create an instance of the `StrapiEntity` class
    ```ts
    import { StrapiEntity } from "code-specialist-strapi-client";
    const postEntity = new StrapiEntity<IPost>({client: client, path: "posts", childEntities: ["image", "author", "author.image"]})
    ```

4. Use the instance to fetch data from Strapi
    ```ts
    const post: IPost = await postEntity.find({fieldName: "slug", value: "dry"}); // Should be a unique field. However always the first result is returned
    const posts: IPost[] = await postEntity.findAll({fieldName: "category", value: "python")};
    const posts: IPost[] = await postEntity.getAll();
    const post: IPost  = await postEntity.get({id: 1}); // ID
    ```

## Contribution

TODO: Add contribution guidelines "All contributions are welcome"

## Testing

TODO:
- Testing paradigms
- How to run tests
