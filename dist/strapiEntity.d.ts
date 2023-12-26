import { IFilter, IID, IStrapiEntity } from './strapiTypes';
export declare class StrapiEntity<T> {
    private readonly client;
    private readonly path;
    private readonly childEntities?;
    private readonly pageSize;
    constructor(strapiEntity: IStrapiEntity, pageSize?: number);
    private flattenDataStructure;
    private getPopulates;
    private getFilter;
    private queryStrapi;
    private find;
    getAll(): Promise<T[]>;
    findOneBy({ fieldPath, value }: IFilter): Promise<T>;
    findAllBy({ fieldPath, value }: IFilter): Promise<T[]>;
    get({ id }: IID): Promise<T | null>;
}
