
import { EventEmitter } from "./emitter";
import { TRequest, TRequestOptions, TResponse } from "../types";
import { HTTP_STATE } from "./States";
import { HTTP_EVENTS } from "./types";








/**
 * An observer object that encapsulates the lifecycle of a Middleware Request
 */
export class HTTPEventBase{    

    
    protected readonly eventEmitter = new EventEmitter<HTTP_EVENTS,any>();

    public get PROTOCOL(){return this.request.url().split("://")[0]}

    public get URL(){
        return this.request.url();
    }
    
   
    constructor(
        
        public readonly request: TRequest,
        public readonly options: Partial<TRequestOptions> = {},
    )   
    { 
        this.request = request;
        this.options = options;

        this._state = HTTP_STATE.REQUESTING;
    }

    public on(event: HTTP_EVENTS, callable: any){
        return this.eventEmitter.on(event,callable);
    }

    public once(event: HTTP_EVENTS, callable: any){
        const self = this;
        const callOnce = (...args: any[]) => {
            self.eventEmitter.off(event,callable);
            return callable(...args)
        }
        this.eventEmitter.on(event,callOnce)
    }

    public off(event: HTTP_EVENTS, callable: any){
        return this.eventEmitter.off(event,callable);
    }

    public emit(event: HTTP_EVENTS, ...args: any[]){
        //@ts-ignore
        return this.eventEmitter.emit(event, ...args as any[]);
    }
    

  
        
    
    



    protected _state: HTTP_STATE;

    public get state(){
        return this._state;
    }
    protected set state(state: HTTP_STATE){
        this._state = state;
    }
 

}   

