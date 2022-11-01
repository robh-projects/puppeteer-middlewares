
import { Mixin, settings } from "ts-mixer";
import { TRequest, TRequestOptions, TResponse } from "../types";
import { HTTPEventBase } from "./Base";
import { HTTPEventResponseMixin } from "./Mixins/Response";
import { HTTPEventSettersMixin } from "./Mixins/Setters";


settings.initFunction = 'init';

/**
 * Abstracts and encapsulates the lifecycle and behaviors of a request 
 */
export class HTTPEvent extends Mixin(
    HTTPEventBase,
    HTTPEventSettersMixin,
    HTTPEventResponseMixin
){    


    // TODO: Improve encapsulation
    
    constructor(
        
        public readonly request: TRequest,
        public readonly options: Partial<TRequestOptions> = {
            headers: {},
        }
    )   {
        super(request,options);
    }
}   
