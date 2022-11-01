import { HTTPRetryRule, HTTPRule } from "../Rule";
import { HTTPEvent } from "../../Event";
import { HTTPRulesCollection } from "../Collection";
import { IHTTPRetryRule, IHTTPRule } from "../types";
import { EFFECTS } from "./enum";
import { HTTPRuleEffectsRegistry } from "./Registry";


import { HTTPRuleEffect } from "./Registry";



/**
 * Manages rules and effects within the context of an HTTPEvent
 */
export class HTTPRuleEffectsResolver{


    constructor(
        protected readonly rules: HTTPRulesCollection
    ){}

    resolve = (event: HTTPEvent): HTTPRuleEffectsRegistry => { 
        // TODO: Move to factory

        const registry = new HTTPRuleEffectsRegistry();
        
        // Iterate through each HTTPRule
        for (const rule of this.rules.iter()){

            // Match the rule against the event
            if (rule.matches(event)){

                for (const [effect, value] of rule.effects.iterator()){
                    registry.register(new HTTPRuleEffect(effect, value));
                }
               
            }
        }
        
        return registry;
    }
}