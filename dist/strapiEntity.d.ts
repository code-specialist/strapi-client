import { AxiosInstance } from "axios";
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
export declare class StrapiEntity<T> {
    private readonly client;
    private readonly path;
    private readonly childEntities?;
    constructor(strapiEntity: IStrapiEntity);
    private spreadEntity;
    private spreadChildEntity;
    private setObjectValue;
    private unpackEntity;
    private getPopulates;
    private getFilter;
    private find;
    getAll(): Promise<T[]>;
    findOneBy({ fieldName, value }: IFilter): Promise<T>;
    findAllBy({ fieldName, value }: IFilter): Promise<T[]>;
    get({ id }: IID): Promise<T>;
}
export {};
