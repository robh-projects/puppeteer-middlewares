import { nextTick } from "process";
import { HTTPEvent } from "..";
import { HTTP_STATE } from "../States";
import { HTTP_EVENTS, HTTP_EVENT_HANDLE } from "../types";
import { HTTPEventHandleResolver } from "./Resolver";



export class HTTPEventHandleProvider{
    


    private resolver: HTTPEventHandleResolver

    constructor(
        //protected readonly handleResolver = HTTPEventHandleResolver(event);
        protected readonly event: HTTPEvent
    ){
        this.resolver = new HTTPEventHandleResolver()

        this.generator = this.generator.bind(this);
    }

    

    private getNextHandle = async () => {
        // Wait for the next tick
        
        return new Promise((resolve) => {
            const handle = () => {
                resolve(this.resolver.resolve(this.event));
                this.event.off(HTTP_EVENTS.RULES_APPLIED, handle);
            }
            this.event.on(HTTP_EVENTS.RULES_APPLIED, handle)
        })
        // await nextTick();
        // return this.resolver.resolve(this.event);
    }


    async *generator(): AsyncGenerator<HTTP_EVENT_HANDLE>{
        let handle;
        // Will yield on status changes
        while ((handle = await this.getNextHandle()) !== undefined){
            yield handle as HTTP_EVENT_HANDLE;
        }
    }
}

