import { HTTPRuleCondition, HTTPRuleConditions } from "./Condition";

import { IRuleConditionEntry, IHTTPRule as IHTTPRule, IHTTPRetryRule, THTTPRuleConditions, IRuleConditionCollection } from "./types";

import { HTTPEvent } from "../Event";
import { HTTPRuleEffectCollection } from "./Effect/Collection";
import { RETRY_RULE_DEFAULT_COUNT } from "../../config";
import { HTTP_STATE } from "../Event/States";


export class HTTPRule implements IHTTPRule {

    parent?: HTTPRetryRule | HTTPRule


    effects: HTTPRuleEffectCollection

    conditions?: HTTPRuleConditions

    retryRule?: HTTPRetryRule

    protected _rule: IHTTPRetryRule | IHTTPRule;

    constructor(
        rule: IHTTPRule
    ){
        
        this.setConditions(rule.conditions);
        this.effects = new HTTPRuleEffectCollection((rule.effects || {}) as any);
        this._rule = rule;
        
        this.setRetryRule(rule.retryRule);  
        this.matches = this.matches.bind(this);
    }   


    validate = () => {
        // Validate that each rule has only one action
        // ...meaning either "block", "retry" or "proxy"
        // Raise an error if more than one action is specified
        const actions = ['block', 'retry', 'proxy'];
        const self = this;
        const actionCount = actions.reduce((acc, action) => {
            // Verify if `self` has the property `action`
            if (self.hasOwnProperty(action))
                acc++;                
            return acc;
        }, 0);

        if (actionCount > 1){
            throw new Error(`Invalid rule: ${JSON.stringify(this)}: only one action of (${actions.join(' | ')}) can be specified`);
        }
    }

    matches (event: HTTPEvent){
        if (!this.conditions){
            if (this instanceof HTTPRetryRule){
                return event.state === HTTP_STATE.RESPONSE_RECEIVED || event.state === HTTP_STATE.REQUEST_ERRORED;
            }
            return true;
        }
        
        //const rules = (this.conditions?.rules as HTTPRuleCondition[]);

        //const matchFn = this.conditions.operator === 'OR' ? rules.some : rules.every;

        return this.conditions.matches(event);
        
        //return matchFn.call(rules,((c: HTTPRuleCondition) => c.matches(event)));

    }


    private setConditions = (conditions: THTTPRuleConditions | undefined) => {
        if (conditions){
            const isCollection = HTTPRuleConditions.isCollection(conditions);

            if (isCollection){
                const _conditions = conditions as IRuleConditionCollection;

                this.conditions = new HTTPRuleConditions(
                    _conditions.operator, 
                    _conditions.rules.map(
                        //@ts-ignore
                        (condition: IRuleConditionEntry) => new HTTPRuleCondition(condition.type, condition.match)
                    )
                );
            }
            else {
                const _condition = conditions as IRuleConditionEntry;
                this.conditions = new HTTPRuleConditions(
                    _condition.operator || 'OR', 
                    [
                        new HTTPRuleCondition(_condition.type, _condition.match),
                        
                    ]
                );
            }
        }
    }

    private setRetryRule = (retryRule: IHTTPRetryRule | undefined) => {
        // Retry rules can be recursive.
        if (retryRule){
            function recurse(rule: IHTTPRetryRule, parent: HTTPRule | HTTPRetryRule): HTTPRetryRule{
                if (rule.retryRule){
                    rule.retryRule = recurse(rule.retryRule, parent);
                }
                const obj = new HTTPRetryRule(rule);
                // set the parent
                obj.parent = parent;
                return obj;
                
            }
            this.retryRule = recurse(retryRule,this);
        }
    }

}


export class HTTPRetryRule extends HTTPRule implements IHTTPRetryRule{
    
    retryCount = 1;

    constructor(
        _rule: IHTTPRetryRule,
    ){
        super(_rule);
        this.retryCount = _rule.retryCount || RETRY_RULE_DEFAULT_COUNT;
        this.matches = this.matches.bind(this);
    }

    isDescendantOf = (rule: HTTPRule | HTTPRetryRule) => {
        let parent = this.parent;
        while (parent){
            if (parent === rule)
                return true;
            parent = parent.parent;
        }
        return false;
    }


    matches(event: HTTPEvent){
        // Find the parent HTTPRule and make sure it matches
        let parent: HTTPRule | HTTPRetryRule | undefined = this.parent;
        while (parent){
            if (parent instanceof HTTPRule){
                if (!parent.matches(event)){
                    return false;
                }
                break;
            }
            //@ts-ignore
            parent = parent?.parent;
        }

        return super.matches(event);
    }

}
