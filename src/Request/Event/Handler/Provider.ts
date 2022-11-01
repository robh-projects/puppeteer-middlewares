import { nextTick } from "process";
import { HTTPEvent } from "..";
import { HTTP_STATE } from "../States";
import { HTTP_EVENTS, HTTP_EVENT_HANDLE } from "../types";
import { HTTPEventHandleResolver } from "./Resolver";



export class HTTPEventHandleProvider{
    


    private resolver: HTTPEventHandleResolver


    private current: HTTP_EVENT_HANDLE | undefined;

    constructor(
        //protected readonly handleResolver = HTTPEventHandleResolver(event);
        protected readonly event: HTTPEvent
    ){
        this.resolver = new HTTPEventHandleResolver()
        this.current = undefined;        

        this.generator = this.generator.bind(this);
    }

    private getNextHandle = async () => {
        const self =  this;
        return new Promise((resolve, reject) => {
            const onStatusChangedFn =  (previous: HTTP_STATE, current: HTTP_STATE) => {
                let handle;
                try{
                    handle = this.resolver.resolve(self.event)
                    resolve (handle)
                }
                catch (error){
                    handle = undefined;
                    return reject(error)
                }
                finally{
                    if (handle === undefined){
                        self.event.off(HTTP_EVENTS.STATE_CHANGED,onStatusChangedFn)
                    }
                }

            };
            // bootstrap
            onStatusChangedFn(this.event.state,this.event.state);
        });
        
    }


    async *generator(): AsyncGenerator<HTTP_EVENT_HANDLE>{
        let handle;
        // Will yield on status changes
        while ((handle = await this.getNextHandle()) !== undefined){
            yield handle as HTTP_EVENT_HANDLE;
        }
    }
}