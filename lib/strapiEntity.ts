import { AxiosInstance } from "axios";
import { strapiClient } from "./strapiClient";

interface GenericAttribute {
	[key: string]: any;
}

interface GenericStrapiEntity {
	id: number;
	attributes: GenericAttribute[];
}

interface GenericStrapiData {
	data: GenericStrapiEntity;
}

export class StrapiType<T> {
	constructor(
		private readonly path: string,
		private readonly client: AxiosInstance = strapiClient,
		private readonly childEntities?: string[],
	) {}

	private spreadEntity(entity: GenericStrapiEntity): T | null {
		if (!entity) {
			return null;
		}

		const result = { id: entity.id, ...entity.attributes } as T;
		return result;
	}

	private spreadChildEntity(entity: GenericStrapiData): T | null {
		if (!entity?.data) {
			return null;
		}

		const result = { id: entity.data.id, ...entity.data.attributes } as T;
		return result;
	}

	private setObjectValue(object: any, path: string, value: any) {
		const pathArray = path.split(".");
		let currentObj = object;

		for (let i = 0; i < pathArray.length - 1; i++) {
			const key = pathArray[i];
			if (currentObj[key] === undefined) {
				currentObj[key] = {};
			}
			currentObj = currentObj[key];
		}
		currentObj[pathArray[pathArray.length - 1]] = value;
	}

	private unpackEntity(entity: GenericStrapiEntity): T {
		const baseEntity = this.spreadEntity(entity);

		if (!this.childEntities) {
			return baseEntity as T;
		}

		this.childEntities.forEach((childEntity) => {
			const path = childEntity.split(".");

			path.forEach((pathPart, depth) => {
				let targetValue = baseEntity;
				for (const key of path.splice(depth)) {
					if (!targetValue) {
						throw new Error(`Invalid path ${childEntity}`);
					}
					// @ts-ignore TODO: fix this
					targetValue = targetValue[key];
				}
				// @ts-ignore TODO: fix this
				const content = this.spreadChildEntity(targetValue);
				this.setObjectValue(baseEntity, childEntity, content);
			});
		});

		return baseEntity as T;
	}

	private getPopulates(): object {
		return this.childEntities ? { populate: this.childEntities.join(",") } : {};
	}

	private getFilter(fieldName: string, value: string): object {
		return { [`filters\[${fieldName}\]`]: value };
	}

	private async find(
		fieldName: string,
		value: string,
	): Promise<GenericStrapiEntity[]> {
		const response = await this.client.get(this.path, {
			params: {
				...this.getPopulates(),
				...this.getFilter(fieldName, value),
			},
		});
		return response.data.data;
	}

	public async getAll(): Promise<T[]> {
		const response = await this.client.get(this.path, {
			params: this.getPopulates(),
		});
		const data = response.data.data as GenericStrapiEntity[];
		return data.map((entry) => this.unpackEntity(entry));
	}

	public async findOneBy(fieldName: string, value: string): Promise<T> {
		const data = await this.find(fieldName, value);
		const entity = data[0] as GenericStrapiEntity;
		return this.unpackEntity(entity) as T;
	}

	public async findAllBy(fieldName: string, value: string): Promise<T[]> {
		const data = await this.find(fieldName, value);
		return data.map((entry) => this.unpackEntity(entry));
	}

	public async get(id: number): Promise<T> {
		const response = await this.client.get(`${this.path}/${id}`, {
			params: this.getPopulates(),
		});
		const data = response.data.data as GenericStrapiEntity;
		return this.unpackEntity(data) as T;
	}
}
