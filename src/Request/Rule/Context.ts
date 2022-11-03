import { HTTPRetryRule, HTTPRule } from "./Rule";
import { HTTPEvent } from "../Event";
import { HTTP_STATE } from "../Event/States";
import { HTTPRulesCollection } from "./Collection";
import { EFFECTS } from "./Effect/enum";
import { HTTPRuleEffect, HTTPRuleEffectsRegistry as EffectsRegistry } from "./Effect/Registry";



/**
 * Describes a context of rules attributed to an HTTPEvent 
 */
export class HTTPEventRulesContext{

    private readonly effects: EffectsRegistry = new EffectsRegistry()

    private rules = new HTTPRulesCollection();


    public retryHandle: RetryHandle | undefined = undefined;


    constructor(
        public readonly event: HTTPEvent,
        public readonly previous: HTTPEventRulesContext | undefined
    ){

    }

    /**
     * Register a rule to the context
     */
    public register = (rule: HTTPRule | HTTPRetryRule) => {
        
        // For each key of effect, create a registry entry
        for (const [effect, value] of rule.effects.iterator()){
            
            // Create a registry entry
            const entry = new HTTPRuleEffect(effect, rule);

            this.effects.register(entry);

            
        }
        this.rules.add(rule);

        if (rule instanceof HTTPRetryRule && !this.retryHandle?.sameAs(rule)){

            this.retryHandle = new RetryHandle(rule);
        }
    }

    private voided = false;

    // When voided, BYPASS will be applied to event
    void = () => {
        this.voided = true;
    }

    couldRetry = () => {
        return this.event.state === HTTP_STATE.RESPONSE_RECEIVED || this.event.state === HTTP_STATE.REQUEST_ERRORED;
    }

    /**
     * Applies rules to an event
     */
    apply = (event: HTTPEvent) => {
        // If no rules were applied
        if (this.rules.empty()){
            // And no previous rules context
            if (this.voided && !event.responses.count){
                event.setState(HTTP_STATE.TO_BYPASS);
            }
        }
        else{
            // We need a way to have visibility upon previously applied context rule
            switch (event.state){
                case HTTP_STATE.REQUESTING:
                    this.effects.applySome(
                        event,
                        EFFECTS.BLOCK,
                        EFFECTS.PROXY,
                        EFFECTS.SET_HEADERS
                    );
                    break;
                case HTTP_STATE.RESPONSE_RECEIVED:
                case HTTP_STATE.REQUEST_ERRORED:
                    this.effects.applySome(
                        event,
                        EFFECTS.PROXY,
                        EFFECTS.SET_HEADERS
                    );
                    if (this.retryHandle){
                        event.setState(HTTP_STATE.TO_RETRY);
                        this.retryHandle.hit();
                    }
                    break;
            }
        }
        return this;
        
    }   

    collection = () => {
        return this.effects.collection();
    }


    has = (rule: HTTPRule | HTTPRetryRule) : boolean => {
        return this.rules.has(rule);
    }



    hasAnyRules = () => {
        return this.rules.empty();
    }
    



}


export class RetryHandle{
    

    constructor(
        public readonly rule: HTTPRetryRule,
        public retriesLeft = rule.retryCount
    ){
    }

    sameAs = (rule:HTTPRule | HTTPRetryRule) => {
        return this.rule == rule;
    }

    exhausted = () => {
        return this.retriesLeft <= 0;
    }


    hit = () => {
        this.retriesLeft--;
    }

}
