## Intro

TODO:
- What does it do
- What are the benefits
- How does it do it
- what are the limitations

## Installation

1. Login to the private registry with your GitHub username and a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `read:packages` scope
    ```sh
    npm login --registry=https://npm.pkg.github.com
    ```

2. Install the package
    ```sh
    npm install @code-specialist/strapi-client
    ```


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
    import { createStrapiClient } from "@code-specialist/strapi-client";

    const client = createStrapiClient({baseUrl: "https://cs.code-specialist.con", apiKey: "YOUR_API_KEY"});
    ```   

3. Create an instance of the `StrapiEntity` class
    ```ts
    import { StrapiEntity } from "@code-specialist/strapi-client";
    const postEntity = new StrapiEntity<IPost>({client: client, path: "posts", childEntities: ["image", "author", "author.image"]})
    ```

4. Use the instance to fetch data from Strapi
    ```ts
    const post: IPost = await postEntity.find({fieldName: "slug", value: "dry"}); // Should be a unique field. However always the first result is returned
    const posts: IPost[] = await postEntity.findAll({fieldName: "category", value: "python")};
    const posts: IPost[] = await postEntity.getAll();
    const post: IPost  = await postEntity.get({id: 1}); // ID
    ```

## Testing

TODO:
- Testing paradigms
- How to run tests

## Building & Publishing

TODO:
- Create Workflow