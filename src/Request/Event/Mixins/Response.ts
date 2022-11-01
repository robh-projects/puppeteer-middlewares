import { HTTPEventBase } from "../Base"; 
import { TRequest, TRequestOptions, TResponse } from "../../types";
import { Mixin } from "ts-mixer";
import { HTTPEventSettersMixin } from "./Setters";
import { HTTP_EVENTS } from "../types";
import { HTTP_STATE } from "../States";
import { HTTPEvent } from "..";




export class HTTPEventResponseMixin extends Mixin(HTTPEventBase, HTTPEventSettersMixin) {

    
    constructor(
        public readonly request: TRequest,
        public readonly options: Partial<TRequestOptions> = {}
    )   {
        super(request,options);
    }

    

    public responses = {
        __array: [] as TResponse[],
        last: () => this.responses.__array[this.responses.__array.length-1],
        count: 0
    }


    /**
     * Saves a response
     */
    public addResponse(response: TResponse){
        this.responses.__array.push(response);
        this.responses.count++;
        this.setState(HTTP_STATE.RESPONSE_RECEIVED)
        this.emit(HTTP_EVENTS.RESPONSE_REGISTERED,this);
        return this;
    }
  
    

    /**
     * Returns the last known registered response
     */
    public get response(): TResponse{
        return this.responses.last();
    }

    
}