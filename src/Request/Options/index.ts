
import { RequestOptionsBase } from "./Base";
import { HeadersRequestOptions } from "./Mixins/Headers";
import { ProxyRequestOptions } from "./Mixins/Proxy";

import { Mixin } from 'ts-mixer';


export class RequestOptions extends Mixin(RequestOptionsBase, HeadersRequestOptions, ProxyRequestOptions) {

    public getOptions = () => {
        return this.options;
    }
}
