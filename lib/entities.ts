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

interface GenericStrapiData {
	data: GenericStrapiEntity;
}

interface GenericStrapiEntity {
	id: number;
	attributes: GenericAttribute[];
}

export class StrapiType<T> {
	constructor(
		public path: string,
		private client: AxiosInstance,
		public childEntities?: string[],
	) {
		this.childEntities = childEntities;
	}

	private spreadEntity(entity: GenericStrapiEntity) {
		if (!entity) {
			return null;
		}
		return { id: entity.id, ...entity.attributes };
	}

	private spreadChildEntity(entity: GenericStrapiData) {
		if (!entity?.data) {
			return null;
		}
		return { id: entity.data.id, ...entity.data.attributes };
	}

	// TODO: Fix types
	private setObjectValue(obj: object, path: string, value: any) {
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

	//TODO: Fix types
	private unpackEntity(entity: GenericStrapiEntity) {
		const baseEntity = this.spreadEntity(entity);
		// spread each child entity into the base entity
		if (!this.childEntities) {
			return baseEntity;
		}

		this.childEntities.forEach((childEntity: string) => {
			const path = childEntity.split(".");

			path.forEach((child, depth) => {
				let targetValue = baseEntity;
				// Iterate downwards to the target value
				for (const key of path.splice(depth)) {
					targetValue = targetValue[key];
				}

				const content = this.spreadChildEntity(targetValue);
				this.setObjectValue(baseEntity, childEntity, content);
			});
		});
		return baseEntity;
	}

	private getPopulateString() {
		return this.childEntities ? `populate=${this.childEntities.join(",")}` : "";
	}

	public async find(): Promise<T[]> {
		const response = await this.client.get(
			`${this.path}?${this.getPopulateString()}`,
		);
		const data = response.data.data as GenericStrapiEntity[];
		return data.map((entry) => this.unpackEntity(entry)) as T[];
	}

	public async get(id: number) {
		// TODO: implement
	}
}
