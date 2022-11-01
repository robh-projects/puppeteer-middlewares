import { HTTPRetryRule, HTTPRule } from "./Rule";
import { HTTPEvent } from "../Event";
import { EFFECTS } from "./Effect/enum";
import { IHTTPRetryRule, IHTTPRule, TRequestRuleCollection } from "./types";



/**
 * A collection of rules
 * Nested rules are submitted to a flat collection
 */
export class HTTPRulesCollection {

    private rules: Set<HTTPRule|HTTPRetryRule>;

    constructor(
        ...rules: TRequestRuleCollection
    ){ 
        this.iter = this.iter.bind(this);
        this.rules = new Set();
        rules.map(this.add)
    }

    /**
     * Iterate through normalised rules
     * Retry rules will be yielded consecutively (flattened)
     */
    *iter(): Generator<HTTPRule>{
        for (const rule of this.rules){
            yield rule 
            for(let retryRule of this.iterRetryRules(rule)){
                yield retryRule;
            }
            
        }
    }

    array = () => {
        return Array.from(this.iter());
    }

    add = (rule: IHTTPRule | HTTPRule) => {
        // Do not add empty rules only having RetryRules
        if (Object.keys(rule).length === 1 && rule.retryRule){
            this.rules.add(new HTTPRetryRule(rule.retryRule as IHTTPRetryRule));  
            return;
        }
        this.rules.add(rule instanceof HTTPRule ? rule : new HTTPRule(rule));
    }

    has = (rule: HTTPRule) => {
        return this.rules.has(rule);
    }

    empty = () => {
        return this.rules.size === 0;
    }
    
    


    

    /**
     * Iterates through each retry rule recursively
     */
    private *iterRetryRules(parent: HTTPRule | HTTPRetryRule | undefined): Generator<HTTPRetryRule>{
        if (parent && parent.retryRule){
            yield parent.retryRule;
            yield* this.iterRetryRules(parent.retryRule);
        }
    }



}