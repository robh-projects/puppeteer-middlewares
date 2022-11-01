import { HTTPRulesCollection as RulesCollection } from './Collection';
import { HTTPEventRulesContext as RulesContext, RetryHandle } from './Context';
import { HTTPEvent } from '../Event';
import { HTTPRetryRule, HTTPRule } from './Rule';

/**
 * Resolves to a context of rules that match to an HTTPEvent
 */
export class HTTPRuleContextResolver {
    //@ts-ignore


    
    constructor(protected readonly rules: RulesCollection) {}

    /**
     * Creates a "context" of a appliable rules
     */
    resolve = (event: HTTPEvent, previousContext: RulesContext | undefined = undefined): RulesContext => {
        
        let matchCnt = 0;

        const context = new RulesContext(event,previousContext);


        // Iterate through each HTTPRule
        for (const rule of this.rules.iter()) {
            // Match the rule against the event
            if (rule.matches(event)) {
                matchCnt++;
                if (!this.assertContextIntegrity(rule, context)){
                    continue;
                }

                context.register(rule);
            }
        }
        if (!matchCnt){
            // No rules will ever match this event
            context.void();
        }

        return context;
    };

    /**
     * Ensures that:
     * - A nested [Retry Rule] is part of the same context
     * - The previous [Retry Rule] has completed its lifecycle 
     * - That a [Retry Rule] is appliable to the event state
     */
    private assertContextIntegrity = (rule: HTTPRetryRule | HTTPRule, curCtx: RulesContext) => {

        const prevCtx = curCtx.previous;


        if (rule instanceof HTTPRetryRule){
            
            if (!curCtx.couldRetry()){
                return false;
            }

            const isSameRule = prevCtx?.retryHandle?.sameAs(rule) ?? false;

            if (isSameRule ){    

                

                if (prevCtx?.retryHandle?.exhausted()){
                    // Retries exhausted
                    return false;
                }

                // Migrate retryhandle
                curCtx.retryHandle = prevCtx?.retryHandle;

                // Same rule, more retries to go
                return true;
                
            }
            else{

                // If the current context already has a retry rule and it's not exhausted, abort
                if (curCtx?.retryHandle && !curCtx.retryHandle.exhausted()){
                    return false;
                }
                
                // If this is not the descendant of the previous retry rule, then abort
                if (prevCtx?.retryHandle?.rule.retryRule && prevCtx.retryHandle.rule.retryRule !== rule){
                    return false;
                }

                // Verify that this rule has not already been applied
                let targetCtx = prevCtx;
                while (targetCtx){
                    if (targetCtx.retryHandle?.sameAs(rule)){
                        return false;
                    }
                    targetCtx = targetCtx.previous;
                }
            }
        }
        return true;

    }   
}



class ContextRule{
    constructor(
        public readonly rule: HTTPRule,
        public readonly context: RulesContext
    ){}
}