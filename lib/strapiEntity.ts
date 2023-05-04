import { AxiosInstance } from "axios";
import { GenericStrapiData, GenericStrapiEntity, IFilter, IID, IStrapiEntity } from "./strapiTypes";


export class StrapiEntity<T> {
	private readonly client: AxiosInstance;
	private readonly path: string;
	private readonly childEntities?: string[];

	constructor(strapiEntity: IStrapiEntity) {
		this.client = strapiEntity.client;
		this.path = strapiEntity.path;
		this.childEntities = strapiEntity.childEntities;
	}

	private flattenDataStructure(data: any) {
		if (!data) {
			return null;
		}

		if (data.hasOwnProperty("data")) {
			data = data.data;
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

	private async find(
		fieldName: string,
		value: string,
	): Promise<GenericStrapiData<GenericStrapiEntity<any>[]>> {
		const response = await this.client.get(this.path, {
			params: {
				...this.getPopulates(),
				...this.getFilter(fieldName, value),
			},
		});
		return response.data;
	}

	public async getAll(): Promise<T[]> {
		const response = await this.client.get(this.path, {
			params: this.getPopulates(),
		});
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
		const response = await this.client.get(`${this.path}/${id}`, {
			params: this.getPopulates(),
		});
		return this.flattenDataStructure(response.data);
	}
}
