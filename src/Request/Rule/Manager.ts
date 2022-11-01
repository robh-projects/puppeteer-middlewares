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

    }

    watch = (event: HTTPEvent) => {

        // Observe event for state changes to apply rules on-the-fly
        [HTTP_EVENTS.RESPONSE_REGISTERED, HTTP_EVENTS.REQUEST_READY].map((STATE)=> event.on(STATE,this.onHTTPEventStatusChanged))


        this.onHTTPEventStatusChanged(event);
    }


    release = (event: HTTPEvent) => {
        // Remove event listeners
        [HTTP_EVENTS.RESPONSE_REGISTERED, HTTP_EVENTS.REQUEST_READY].map((STATE)=> event.off(STATE,this.onHTTPEventStatusChanged))
    }
}