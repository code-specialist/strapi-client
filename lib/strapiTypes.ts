import { AxiosInstance } from 'axios'

export interface StrapiBaseDataType {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt: Date
}

interface ImageFormat {
    ext: string
    url: string
    hash: string
    mime: string
    name: string
    path?: string
    size: number
    width: number
    height: number
}

export interface StrapiBaseImageType {
    name: string
    alternativeText?: string
    caption?: string
    width: number
    height: number
    formats: {
        thumbnail?: ImageFormat
        small?: ImageFormat
        medium?: ImageFormat
        large?: ImageFormat
    }
    hash: string
    ext: string
    mime: string
    size: number
    url: string
    previewUrl?: string
    provider: string
    provider_metadata?: string
    createdAt: Date
    updatedAt: Date
}

export interface GenericStrapiEntity<T> {
    id: number
    attributes: T
}

export interface GenericStrapiData<T> extends Object {
    data: GenericStrapiEntity<T>[]
    meta: {
        pagination: {
            page: number
            pageSize: number
            pageCount: number
            total: number
        }
    }
}

export interface IFilter {
    fieldPath: string | string[]
    value: string
}

export interface IID {
    id: number
}

export interface IStrapiEntity {
    client: AxiosInstance
    path: string
    childEntities?: string[]
}

export interface IQueryStrapi {
    path?: string
    populates?: object
    filters?: object
    page?: number
}
