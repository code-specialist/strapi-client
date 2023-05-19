
[![All Contributors](https://img.shields.io/github/all-contributors/code-specialist/strapi-client?color=ee8449&style=flat-square)](#contributors) [![CodeQL](https://github.com/code-specialist/strapi-client/actions/workflows/codeql.yml/badge.svg)](https://github.com/code-specialist/strapi-client/actions/workflows/codeql.yml)

---
# Introduction

The main purpose of this library is to streamline the integration of Strapi APIs into TypeScript projects. It provides a typed interface for interacting with Strapi entities and offers a client creation function that encapsulates the necessary configuration.

### Functionality

The library enables you to perform the following tasks:

- Query and retrieve data from Strapi entities
- Filter data based on specified criteria
- Paginate through data sets
- Retrieve single entities by ID or find entities based on specific attributes

### Benefits

By using this library, you can:

- Leverage TypeScript's static typing to ensure type safety when interacting with Strapi entities.
- Simplify the process of querying and retrieving data from Strapi by providing a convenient and intuitive interface.
- Easily customize and extend the library to fit your specific project needs.

### Implementation

The library utilizes Axios, a popular HTTP client, to make requests to the Strapi API. It provides a set of interfaces that define the data structures used by Strapi, such as base data types and image types. Additionally, it includes utility functions for flattening and manipulating the received data to provide a more accessible and consistent format.

### Limitations

It's important to note the following limitations of this library:

- Currently, it does not support attributes named `data` in Strapi entities.
- Error handling and retries are not yet implemented 

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
- [ ] Error handling and retry logic
- [ ] Support attributes called `data` in entities


If you have any feature requests, please open an issue with the `enhancement` label or simply create a pull request.

## Usage

1. Create an interface for your entity that extends the `StrapiBaseDataType` interface
    ```ts
    import { StrapiBaseDataType, StrapiBaseImageType } from "code-specialist-strapi-client";
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

We appreciate and welcome contributions from the community to make this library even better! Whether you're a developer, designer, or documentation enthusiast, there are several ways you can contribute to this project and have a positive impact:

- **Bug Reports and Feature Requests**: If you encounter any bugs or have ideas for new features, please submit an issue on our [issues](https://github.com/code-specialist/strapi-client/issues/new). Be sure to provide clear and detailed information to help us understand and address the problem effectively.

- **Code Contributions**: If you'd like to contribute code to the project, feel free to fork the repository, make your changes, and submit a pull request. We review all pull requests and appreciate improvements, bug fixes, and optimizations. Please ensure that your code adheres to our coding standards and includes appropriate tests and documentation.

- **Documentation Improvements**: Documentation is vital to help users understand and utilize the library effectively. If you notice any areas that can be clarified, expanded, or improved, please submit a pull request with your proposed changes. We value well-written and comprehensive documentation.

- **Community Support**: Help us build a thriving and inclusive community around this library. You can participate in discussions, answer questions, and provide support to fellow developers on our [issues](https://github.com/code-specialist/strapi-client/issues/new). Sharing your experiences and knowledge can make a significant difference to the success of the project.

Remember, every contribution, no matter how big or small, is valuable and appreciated. We follow the [All Contributors](https://allcontributors.org) specification to recognize and celebrate all contributors' efforts. By contributing to this project, you become a part of our growing community and leave a positive impact on developers using this library.

Thank you for considering contributing to this project. We look forward to your involvement and appreciate your support in making this library the best it can be!

## Testing

Tests are provided using Jest. To run the tests, clone the repository and run the following command:

```sh
pnpm i
pnpm test
```

## API Reference

### Strapi Client (`strapiClient.ts`)

#### `ICreateStrapiClient`

Represents the configuration for creating a Strapi client.

- `baseUrl` (string): The base URL of the Strapi API.
- `apiKey` (string): The API key used for authentication.
- `timeout` (optional number): The request timeout in milliseconds.
- `additionalConfig` (optional CreateAxiosDefaults<any>): Additional configuration options for the Axios instance.

### Methods

#### `createStrapiClient(config: ICreateStrapiClient): AxiosInstance`

Creates a Strapi client instance configured with the provided options.

- `config` (ICreateStrapiClient): The configuration options for creating the client.
- Returns: AxiosInstance - The Axios instance configured for the Strapi API.

### Non-exported Interfaces

These interfaces are not intended to be used directly outside of the codebase and are internal to the implementation.

#### `CreateAxiosDefaults<T>`

Represents the default configuration options for creating an Axios instance.

### StrapiEntity (`strapiEntity.ts`)

The `StrapiEntity` class is a utility class that provides methods for querying data from the Strapi API. It is designed to work with entities in the Strapi API and provides functionality for retrieving, filtering, and flattening data structures.

#### Constructor

##### `constructor(strapiEntity: IStrapiEntity, pageSize?: number)`

Creates an instance of the `StrapiEntity` class.

- `strapiEntity` (IStrapiEntity): An object that represents the Strapi entity configuration. It contains the following properties:
  - `client` (AxiosInstance): The Axios instance used for making API requests.
  - `path` (string): The base path of the entity in the Strapi API.
  - `childEntities` (optional string[]): An array of child entity names to include in the query.
- `pageSize` (optional number): The page size to use for paginated queries. Defaults to 25 if not specified.

#### Methods

##### `getAll(): Promise<T[]>`

Retrieves all entities of the configured type from the Strapi API.

- Returns: A promise that resolves to an array of entities of type `T`.

##### `findOneBy({ fieldName, value }: IFilter): Promise<T>`

Retrieves the first entity that matches the specified filter criteria from the Strapi API.

- `fieldName` (string): The name of the field to filter on.
- `value` (string): The value to filter by.
- Returns: A promise that resolves to the first entity of type `T` that matches the filter criteria.

##### `findAllBy({ fieldName, value }: IFilter): Promise<T[]>`

Retrieves all entities that match the specified filter criteria from the Strapi API.

- `fieldName` (string): The name of the field to filter on.
- `value` (string): The value to filter by.
- Returns: A promise that resolves to an array of entities of type `T` that match the filter criteria.

##### `get({ id }: IID): Promise<T>`

Retrieves a specific entity by its ID from the Strapi API.

- `id` (number): The ID of the entity to retrieve.
- Returns: A promise that resolves to the entity of type `T` with the specified ID.

#### Private Methods

##### `flattenDataStructure(data: any): any`

Flattens the nested data structure returned by the Strapi API into a single-level object.

- `data` (any): The data structure to flatten.
- Returns: The flattened data structure.

##### `getPopulates(): object`

Builds the `populates` object used in the API request URL to include child entities.

- Returns: An object representing the populated child entities.

##### `getFilter(fieldName: string, value: string): object`

Builds the filter object used in the API request URL to filter entities by a specific field and value.

- `fieldName` (string): The name of the field to filter on.
- `value` (string): The value to filter by.
- Returns: An object representing the filter criteria.

##### `queryStrapi({ path, populates, filters, page }: IQueryStrapi): Promise<GenericStrapiData<GenericStrapiEntity<any>[]>>`

Performs the actual API request to the Strapi API.

- `path` (string): The API path to query. If not provided, the default path specified in the constructor will be used.
- `populates` (object): An object representing the child entities to include in the query.
- `filters` (object): An object representing the filter criteria for the query.
- `page` (number): The page number for paginated queries.
- Returns: A promise that resolves to the response data from the Strapi API.

### Types and Interfaces (`strapiTypes.ts`)

#### `StrapiBaseDataType`

Represents the base data type for Strapi entities.

- `id` (number): The ID of the entity.
- `createdAt` (Date): The date and time when the entity was created.
- `updatedAt` (Date): The date and time when the entity was last updated.
- `publishedAt` (Date): The date and time when the entity was published.

#### `StrapiBaseImageType`

Represents the base image type for Strapi entities.

- `name` (string): The name of the image.
- `alternativeText` (optional string): The alternative text for the image.
- `caption` (optional string): The caption for the image.
- `width` (number): The width of the image.
- `height` (number): The height of the image.
- `formats` (object): An object containing different formats of the image, such as thumbnail, small, medium, and large.
- `hash` (string): The hash of the image.
- `ext` (string): The extension of the image file.
- `mime` (string): The MIME type of the image.
- `size` (number): The size of the image file in bytes.
- `url` (string): The URL of the image.
- `previewUrl` (optional string): The URL of the preview image.
- `provider` (string): The provider of the image.
- `provider_metadata` (optional string): Additional metadata about the image provider.
- `createdAt` (Date): The date and time when the image was created.
- `updatedAt` (Date): The date and time when the image was last updated.

#### `GenericStrapiEntity<T>`

Represents a generic Strapi entity.

- `id` (number): The ID of the entity.
- `attributes` (T): The attributes of the entity.

#### `GenericStrapiData<T>`

Represents generic Strapi data.

- `data` (GenericStrapiEntity<T>[]): An array of generic Strapi entities.
- `metadata` (object):
  - `pagination` (object):
    - `page` (number): The current page number.
    - `pageSize` (number): The page size.
    - `pageCount` (number): The total number of pages.
    - `total` (number): The total number of entities.

#### `IFilter`

Represents a filter for querying entities.

- `fieldName` (string): The name of the field to filter on.
- `value` (string): The value to filter by.

#### `IID`

Represents an ID for retrieving a specific entity.

- `id` (number): The ID of the entity.

#### `IStrapiEntity`

Represents a Strapi entity configuration.

- `client` (AxiosInstance): The Axios instance used for making API requests.
- `path` (string): The base path of the entity in the Strapi API.
- `childEntities` (optional string[]): An array of child entity names to include in the query.

#### `IQueryStrapi`

Represents the query parameters for querying entities.

- `path` (optional string): The API path to query.
- `populates` (optional object): An object representing the child entities to include in the query.
- `filters` (optional object): An object representing the filter criteria for the query.
- `page` (optional number): The page number for paginated queries.

### Non-exported Interfaces

These interfaces are not intended to be used directly outside of the codebase and are internal to the implementation.

#### `ImageFormat`

Represents the format of an image.

- `ext` (string): The extension of the image file.
- `url` (string): The URL of the image.
- `hash` (string): The hash of the image.
- `mime` (string): The MIME type of the image.
- `name` (string): The name of the image.
- `path` (optional string): The path of the image file.
- `size` (number): The size of the image file in bytes.
- `width` (number): The width of the image.
- `height` (number): The height of the image.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
