import { AxiosInstance } from "axios";

interface GenericAttribute {
	[key: string]: any;
}

export interface StrapiBaseDataType {
	id: number;
	createdAt: Date;
	updatedAt: Date;
	publishedAt: Date;
}

interface ImageFormat {
	ext: string;
	url: string;
	hash: string;
	mime: string;
	name: string;
	path?: string;
	size: number;
	width: number;
	height: number;
}

export interface StrapiBaseImageType {
	name: string;
	alternativeText?: string;
	caption?: string;
	width: number;
	height: number;
	formats: {
		thumbnail?: ImageFormat;
		small?: ImageFormat;
		medium?: ImageFormat;
		large?: ImageFormat;
	};
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl?: string;
	provider: string;
	provider_metadata?: string;
	createdAt: Date;
	updatedAt: Date;
}

interface GenericStrapiEntity {
	id: number;
	attributes: GenericAttribute[];
}

interface GenericStrapiData {
	data: GenericStrapiEntity;
}

type ChildEntity<T> = keyof T & string;

export class StrapiType<T> {
	constructor(
		private readonly path: string,
		private readonly client: AxiosInstance,
		private readonly childEntities?: ChildEntity<T>[],
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

	private setObjectValue(obj: any, path: string, value: any) {
		const pathArray = path.split(".");
		let currentObj = obj;

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

			path.forEach((child, depth) => {
				let targetValue = baseEntity;
				for (const key of path.splice(depth)) {
					targetValue = targetValue[key];
				}

				const content = this.spreadChildEntity(targetValue);
				this.setObjectValue(baseEntity, childEntity, content);
			});
		});

		return baseEntity as T;
	}

	private getPopulateString(): string {
		return this.childEntities ? `populate=${this.childEntities.join(",")}` : "";
	}

	public async getAll(): Promise<T[]> {
		const response = await this.client.get(
			`${this.path}?${this.getPopulateString()}`,
		);
		const data = response.data.data as GenericStrapiEntity[];
		return data.map((entry) => this.unpackEntity(entry));
	}

	public async get(id: number): Promise<T> {
		const response = await this.client.get(
			`${this.path}/${id}?${this.getPopulateString()}`,
		);
		const data = response.data.data as GenericStrapiEntity;
		return this.unpackEntity(data) as T;
	}
}
