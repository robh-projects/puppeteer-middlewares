

import { TRequestOptions } from "../../types";
import { RequestOptionsBase } from "../Base";

import {Fields} from "../types";




export class HeadersRequestOptions extends RequestOptionsBase{


    
    
    public setHeaders = (headers: Fields.TSetHeaders) => {
        let _heads = {}
        if (typeof headers === "function"){
            _heads  = headers(this.options.headers);
        }
        else if (typeof headers === "object"){
            _heads = headers;
        }
        this.options.headers = {...this.options.headers, ..._heads};
    }
}