import { AxiosInstance } from "axios";
import {
  GenericStrapiData,
  GenericStrapiEntity,
  IFilter,
  IID,
  IQueryStrapi,
  IStrapiEntity,
} from "./strapiTypes";

export class StrapiEntity<T> {
  private readonly client: AxiosInstance;
  private readonly path: string;
  private readonly childEntities?: string[];
  private readonly pageSize;

  constructor(strapiEntity: IStrapiEntity, pageSize?: number) {
    this.client = strapiEntity.client;
    this.path = strapiEntity.path;
    this.childEntities = strapiEntity.childEntities;
    this.pageSize = pageSize ?? 25; // Defaults to 25
  }

  private flattenDataStructure(data: any) {
    if (!data) {
      return null;
    }

    if (data.hasOwnProperty("data")) {
      data = data.data;
    }

    if (!data) {
      return null;
    }

    if (data.hasOwnProperty("attributes")) {
      const { attributes, ...rest } = data;
      data = { ...rest, ...attributes };
    }

    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key] = data[key].map((item: any) => {
          return this.flattenDataStructure(item);
        });
      } else if (typeof data[key] === "object") {
        data[key] = this.flattenDataStructure(data[key]);
      }
    }

    return data;
  }

  private getPopulates(): object {
    return this.childEntities ? { populate: this.childEntities.join(",") } : {};
  }

  private getFilter(fieldName: string, value: string): object {
    return { [`filters[${fieldName}]`]: value };
  }

  private async queryStrapi({
    path,
    populates,
    filters,
    page = 1,
  }: IQueryStrapi): Promise<GenericStrapiData<GenericStrapiEntity<any>[]>> {
    const response = await this.client.get<
      GenericStrapiData<GenericStrapiEntity<any>[]>
    >(path ? path : this.path, {
      params: {
        ...(populates ?? {}),
        ...(filters ?? {}),
        "pagination[pageSize]": this.pageSize,
        "pagination[page]": page,
      },
    });
    if (response.data.metadata?.pagination?.pageCount > page) {
      const additionalData = await this.queryStrapi({
        path: path,
        populates: populates,
        filters: filters,
        page: page + 1,
      });
      response.data.data = [...response.data.data, ...additionalData.data];
      return response.data;
    }
    return response.data;
  }

  private async find(
    fieldName: string,
    value: string
  ): Promise<GenericStrapiData<GenericStrapiEntity<any>[]>> {
    return this.queryStrapi({
      populates: this.getPopulates(),
      filters: this.getFilter(fieldName, value),
    });
  }

  public async getAll(): Promise<T[]> {
    const response = await this.queryStrapi(this.getPopulates());
    return this.flattenDataStructure(response.data);
  }

  public async findOneBy({ fieldName, value }: IFilter): Promise<T> {
    const data = await this.findAllBy({ fieldName, value });
    return data[0];
  }

  public async findAllBy({ fieldName, value }: IFilter): Promise<T[]> {
    const data = await this.find(fieldName, value);
    return this.flattenDataStructure(data);
  }

  public async get({ id }: IID): Promise<T> {
    const response = await this.queryStrapi({
      path: `${this.path}/${id}`,
      populates: this.getPopulates(),
    });
    return this.flattenDataStructure(response.data);
  }
}
