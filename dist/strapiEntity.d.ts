import { IFilter, IID, IStrapiEntity } from "./strapiTypes";
export declare class StrapiEntity<T> {
    private readonly client;
    private readonly path;
    private readonly childEntities?;
    constructor(strapiEntity: IStrapiEntity);
    private flattenDataStructure;
    private getPopulates;
    private getFilter;
    private find;
    getAll(): Promise<T[]>;
    findOneBy({ fieldName, value }: IFilter): Promise<T>;
    findAllBy({ fieldName, value }: IFilter): Promise<T[]>;
    get({ id }: IID): Promise<T>;
}
