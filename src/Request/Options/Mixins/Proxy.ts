
import { URLString } from "../../../types";
import { TRequestOptions } from "../../types";
import { RequestOptionsBase } from "../Base";






export class ProxyRequestOptions extends RequestOptionsBase{

    public setProxy = (proxy: TRequestOptions['proxy']) => {
        const proxyIsEmpty = (proxy: URLString) => proxy === "" || proxy === null;

        if (proxyIsEmpty(proxy as string)){
            this.options.proxy = undefined;
        }
    }
}