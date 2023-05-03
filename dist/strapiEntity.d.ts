import { AxiosInstance } from "axios";
export declare class StrapiType<T> {
    private readonly path;
    private readonly client;
    private readonly childEntities?;
    constructor(path: string, client?: AxiosInstance, childEntities?: string[] | undefined);
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
