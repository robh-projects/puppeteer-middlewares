import { RequestMiddleware } from "./Middleware";

import { TRequest } from "./types";
import { HTTPEventHandler } from "./Event/Handler/Handler";

import { HTTPEvent } from "./Event";
import { HTTPNetworking } from "./Networking";
import { HTTPEventHandleProvider } from "./Event/Handler/Provider";
import { HTTPRuleManager } from "./Rule/Manager";
import { HTTP_EVENT_HANDLE } from "./Event/types";
/**
 * A manager that handles Puppetter requests through middlewares
 */
export class HTTPRequestManager{


    private networking = new HTTPNetworking();

    get rules(){
        return this.context.rules;
    }


    constructor(
        private readonly context: RequestMiddleware,
        
        protected readonly EventHandler: HTTPEventHandler = new HTTPEventHandler(),

    ){
        
    }
    


    
    process = async (
        request: TRequest,
        ) => {

        // Construct an HTTPEvent object
        const event = new HTTPEvent(request, await this.networking.defaultOptions());
        

        const RulesManager = new HTTPRuleManager(this.context.rules)
        
        // Watch the event to apply rules on-the-fly
        RulesManager.watch(event);
        
        const handler = new HTTPEventHandleProvider(event);
        // Consume event handles

        for await (const handle of handler.generator()){
            await this.EventHandler.handle(handle,event);
        }

        RulesManager.release(event);
    }
}

