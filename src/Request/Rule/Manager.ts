import { HTTPEvent } from "../Event";
import { HTTP_EVENTS } from "../Event/types";
import { HTTPRulesCollection } from "./Collection";
import { HTTPRuleContextResolver } from "./ContextResolver";
import { HTTPEventRulesContext } from "./Context";
import { HTTP_STATE } from "../Event/States";




export class HTTPRuleManager{


    constructor(
        protected readonly rules: HTTPRulesCollection,
        protected readonly ContextResolver = new HTTPRuleContextResolver(rules)
    ){
        
    }
    
    // TODO: this should be encapsulated per event context
    private lastContext: HTTPEventRulesContext | undefined = undefined;
    

    private onHTTPEventStatusChanged = (event: HTTPEvent) => {
        
        const curCtx = this.ContextResolver.resolve(event, this.lastContext);

        curCtx.apply(event);

        this.lastContext = curCtx;
        
        this.onRulesApplied(event);
    }

    watch = (event: HTTPEvent) => {

        // Observe event for state changes to apply rules on-the-fly
        [HTTP_EVENTS.RESPONSE_REGISTERED, HTTP_EVENTS.REQUEST_READY, HTTP_EVENTS.REQUEST_FAILED].map((STATE)=> event.on(STATE,this.onHTTPEventStatusChanged));


        // Final states
        [HTTP_EVENTS.RESPONSE_SENT, HTTP_EVENTS.REQUEST_BYPASSED, HTTP_EVENTS.REQUEST_ABORTED].map((STATE)=> event.on(STATE, this.onRulesApplied));

        this.onHTTPEventStatusChanged(event);
    }

    

    onRulesApplied = (event: HTTPEvent) => {
        // Remove all listeners
        setTimeout(() => {
            event.emit(HTTP_EVENTS.RULES_APPLIED);   
        });
    }
    

    release = (event: HTTPEvent) => {
        // Remove event listeners
        [HTTP_EVENTS.RESPONSE_REGISTERED, HTTP_EVENTS.REQUEST_READY, HTTP_EVENTS.REQUEST_FAILED].map((STATE)=> event.off(STATE,this.onHTTPEventStatusChanged));
        [HTTP_EVENTS.RESPONSE_SENT, HTTP_EVENTS.REQUEST_BYPASSED, HTTP_EVENTS.REQUEST_ABORTED].map((STATE)=> event.off(STATE, this.onRulesApplied));
    }
}