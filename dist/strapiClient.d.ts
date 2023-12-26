import { CreateAxiosDefaults } from 'axios';
interface ICreateStrapiClient {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    additionalConfig?: CreateAxiosDefaults<any>;
}
export declare function createStrapiClient({ baseUrl, apiKey, timeout, additionalConfig }: ICreateStrapiClient): import("axios").AxiosInstance;
export {};
