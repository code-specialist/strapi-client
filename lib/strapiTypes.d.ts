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
	attributes: object;
}

interface GenericStrapiData {
	data: GenericStrapiEntity;
}

interface IFilter {
	fieldName: string;
	value: string;
}

interface IID {
	id: number;
}

interface IStrapiEntity {
	client: AxiosInstance;
	path: string;
	childEntities?: string[];
}
