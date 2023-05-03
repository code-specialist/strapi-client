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

2. Create a entity class that extends `StrapiEntity`
    ```ts
    import { StrapiEntity } from "@code-specialist/strapi-client";
    class PostEntity extends StrapiEntity<IPost> {
        constructor() {
            super("posts", ["image", "author", "author.image"]);
        }
    }
    ```

3. Create an instance of your entity class
    ```ts
    const postEntity = new PostEntity();
    ```

4. Use the instance to fetch data from Strapi
    ```ts
    const post: IPost = await postEntity.find("slug", "dry");
    const posts: IPost[] = await postEntity.findAll("category", "python");
    const posts: IPost[] = await postEntity.getAll();
    const post: IPost  = await postEntity.get(id: 1);
    ```

### Environment Variables

- `STRAPI_BASE_URL`: The URL of your Strapi instance (e.g. `https://strapi.code-specialist.com`, without `/api`)
- `STRAPI_API_KEY`: A valid API key for your Strapi instance (Atleast read permissions)
- `STRAPI_TIMEOUT`: The timeout for requests to Strapi (default: `10000`) 

## Testing

TODO:
- Testing paradigms
- How to run tests

## Building & Publishing

TODO:
- Create Workflow