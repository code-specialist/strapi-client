import { AxiosInstance } from 'axios';
export declare class StrapiEntity<T> {
    private readonly path;
    private readonly childEntities?;
    private readonly client;
    constructor(path: string, childEntities?: string[] | undefined, client?: AxiosInstance);
    private spreadEntity;
    private spreadChildEntity;
    private setObjectValue;
    private unpackEntity;
    private getPopulates;
    private getFilter;
    private find;
    getAll(): Promise<T[]>;
    findOneBy(fieldName: string, value: string): Promise<T>;
    findAllBy(fieldName: string, value: string): Promise<T[]>;
    get(id: number): Promise<T>;
}
