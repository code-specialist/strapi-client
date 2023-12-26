import { AxiosInstance } from 'axios'
import { GenericStrapiData, GenericStrapiEntity, IFilter, IID, IQueryStrapi, IStrapiEntity } from './strapiTypes'

export class StrapiEntity<T> {
    private readonly client: AxiosInstance
    private readonly path: string
    private readonly childEntities?: string[]
    private readonly pageSize

    constructor(strapiEntity: IStrapiEntity, pageSize?: number) {
        this.client = strapiEntity.client
        this.path = strapiEntity.path
        this.childEntities = strapiEntity.childEntities
        this.pageSize = pageSize ?? 25 // Defaults to 25
    }

    private flattenDataStructure(data: any) {
        if (!data) {
            return null
        }

        // biome-ignore lint/suspicious/noPrototypeBuiltins: Necessary.
        if (data.hasOwnProperty('data')) {
            // biome-ignore lint/style/noParameterAssign: Necessary.
            data = data.data
        }

        if (!data) {
            return null
        }

        // biome-ignore lint/suspicious/noPrototypeBuiltins: Necessary
        if (data.hasOwnProperty('attributes')) {
            const { attributes, ...rest } = data
            // biome-ignore lint/style/noParameterAssign: Necessary.
            data = { ...rest, ...attributes }
        }

        for (const key in data) {
            if (Array.isArray(data[key])) {
                data[key] = data[key].map((item: any) => {
                    return this.flattenDataStructure(item)
                })
            } else if (typeof data[key] === 'object') {
                data[key] = this.flattenDataStructure(data[key])
            }
        }

        return data
    }

    private getPopulates(): object {
        return this.childEntities ? { populate: this.childEntities.join(',') } : {}
    }

    private getFilter(fieldPath: string | string[], value: string): object {
        const isNested = Array.isArray(fieldPath)
        const constructedfieldPath = isNested ? fieldPath.map(key => `[${key}]`).join("") : `[${fieldPath}]`
        return { [`filters${constructedfieldPath}`]: value }
    }

    private async queryStrapi({ path, populates, filters, page = 1 }: IQueryStrapi): Promise<GenericStrapiData<GenericStrapiEntity<any>[]>> {
        // TODO: Add error handling and retries
        const response = await this.client.get<GenericStrapiData<GenericStrapiEntity<any>[]>>(path ? path : this.path, {
            params: {
                ...populates,
                ...filters,
                'pagination[pageSize]': this.pageSize,
                'pagination[page]': page
            }
        })
        if (response.data?.meta?.pagination?.pageCount > page) {
            const additionalData = await this.queryStrapi({
                path: path,
                populates: populates,
                filters: filters,
                page: page + 1
            })
            response.data.data = [...response.data.data, ...additionalData.data]
            return response.data
        }
        return response.data
    }

    private async find(fieldPath: string | string[], value: string): Promise<GenericStrapiData<GenericStrapiEntity<any>[]>> {
        return this.queryStrapi({
            populates: this.getPopulates(),
            filters: this.getFilter(fieldPath, value)
        })
    }

    public async getAll(): Promise<T[]> {
        const strapiObjects = await this.queryStrapi({ populates: this.getPopulates() })
        return this.flattenDataStructure(strapiObjects)
    }

    public async findOneBy({ fieldPath, value }: IFilter): Promise<T> {
        const strapiObjects = await this.findAllBy({ fieldPath, value })
        return strapiObjects[0]
    }

    public async findAllBy({ fieldPath, value }: IFilter): Promise<T[]> {
        const strapiObjects = await this.find(fieldPath, value)
        return this.flattenDataStructure(strapiObjects)
    }

    public async get({ id }: IID): Promise<T | null> {
        const strapiObject = await this.queryStrapi({
            path: `${this.path}/${id}`,
            populates: this.getPopulates()
        })
        if (!strapiObject) {
            return null
        }
        return this.flattenDataStructure(strapiObject)
    }
}
