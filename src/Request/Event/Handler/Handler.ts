
import { HTTPEvent } from "..";
import { HTTPNetworking } from "../../Networking";
import { HTTP_EVENTS, HTTP_EVENT_HANDLE } from "../types";
import { HTTPRuleEffectCollection } from "../../Rule/Effect/Collection";
import { TResponse } from "../../types";
import { EXCEPTIONS } from "../Exception";
import { HTTP_STATE } from "../States";




/**
 * An object that fires HTTPEvent handlers.
 */
export class HTTPEventHandler{


    constructor(){
        this.continue = this.continue.bind(this);
        this.abort = this.abort.bind(this);
        this.respond = this.respond.bind(this);
        this.request = this.request.bind(this);

    }

    
    


    private continue (event: HTTPEvent){
        event.request.continue();
        event.setState(HTTP_STATE.COMPLETED);
        event.emit(HTTP_EVENTS.REQUEST_BYPASSED, event);
    };

    private abort(event: HTTPEvent){
        event.request.abort();
        event.setState(HTTP_STATE.COMPLETED);
        event.emit(HTTP_EVENTS.REQUEST_ABORTED, event);
    }

    private respond(event: HTTPEvent){
        event.request.respond(event.response);
        event.setState(HTTP_STATE.COMPLETED);
        event.emit(HTTP_EVENTS.RESPONSE_SENT, event)
    }

    
    /**
     * Perform a managed request
     */
    private async request (sender: HTTPEvent) : Promise<void> {
        
        const networking = new HTTPNetworking();
        
        let response: TResponse | undefined;
        try{
            response = await networking.requestWith(sender.request, sender.options)
            sender.addResponse(
                response
            );
        }
        catch(e){
            sender.setRequestFailed(EXCEPTIONS.OVERRIDING_REQUEST, e);
            return;    
        }

        // Register the response on the evnet
        
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


