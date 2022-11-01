
import { HTTPEvent } from "..";
import { HTTPNetworking } from "../../Networking";
import { HTTP_EVENT_HANDLE } from "../types";
import { HTTPRuleEffectCollection } from "../../Rule/Effect/Collection";
import { TResponse } from "../../types";
import { EXCEPTIONS } from "../Exception";
import { HTTP_STATE } from "../States";




/**
 * An object that fires HTTPEvent handlers.
 */
export class HTTPEventHandler{



    private networking = new HTTPNetworking();
    


    private continue (event: HTTPEvent){
        event.request.continue();
        event.setState(HTTP_STATE.COMPLETED);
    };

    private abort(event: HTTPEvent){
        event.request.abort();
        event.setState(HTTP_STATE.COMPLETED);
    }

    private respond(event: HTTPEvent){
        event.request.respond(event.response);
        event.setState(HTTP_STATE.COMPLETED);
    }

    
    /**
     * Perform a managed request
     */
    private async request (sender: HTTPEvent) : Promise<void> {
        

        let response: TResponse | undefined;
        try{
            response = await this.networking.requestWith(sender.request, sender.options)
        }
        catch(e){
            sender.setError(EXCEPTIONS.OVERRIDING_REQUEST, e);
            return;    
        }

        // Register the response on the evnet
        sender.addResponse(
            response
        );
    }



    private HANDLE_MAPPINGS = {
        [HTTP_EVENT_HANDLE.ABORT]: this.abort,
        [HTTP_EVENT_HANDLE.RESPOND]: this.respond,
        [HTTP_EVENT_HANDLE.CONTINUE]: this.continue, 
        [HTTP_EVENT_HANDLE.REQUEST]: this.request, 
        [HTTP_EVENT_HANDLE.RETRY]: this.request, 
    }


    public handle = async (handle: HTTP_EVENT_HANDLE, event: HTTPEvent) : Promise<void> => {      
        console.log(`[RequestMiddleware] ${handle} ${event.URL}`);
        //@ts-ignore
        await this.HANDLE_MAPPINGS[handle](event);
        
    }
}


