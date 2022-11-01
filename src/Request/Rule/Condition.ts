import { isUrl } from "../../utils";
import { HTTPEvent } from "../Event";
import { HTTP_STATE } from "../Event/States";

import { ConditionRuleMatchType, IRuleConditionCollection, IRuleConditionEntry, TLogicalOperator, TRuleConditionMatch } from "./types";







export class HTTPRuleCondition implements IRuleConditionEntry {
    

    /**
     * An array of match values
     */
    match: TRuleConditionMatch[];

    constructor(
        public readonly type: ConditionRuleMatchType,
        // Can be either an array or a single entry
        _match: TRuleConditionMatch | TRuleConditionMatch[],
        public readonly operator: TLogicalOperator = 'OR',
    ) {
        
        // If match is not an array, convert it to an array
        this.match = Array.isArray(_match) ? _match : [_match];

        this.validate()
    }


    
    private validate = () => {
        
        const fnValidate = (expression: (match: unknown) => boolean) => this.match.every(expression)
        

        if (!this.type || !this.match){
            throw new Error(`Invalid condition ${this.toJSON()}. Must contain { match, type }"`); 
        }


        if (this.type === ConditionRuleMatchType.URL_REGEXP){
            try {
                fnValidate((match) => {
                    new RegExp(match as string);
                    return true
                });
            } catch (e){
                //@ts-ignore
                throw new Error(`Invalid condition ${this.toJSON()}.` + e.message);
            }
        }

        else if (this.type === ConditionRuleMatchType.ENTIRE_URL){
            if (!fnValidate((match) => isUrl(match as string))){
                throw new Error(`Invalid condition ${this.toJSON()}. With ENTIRE_URL, 'match' must be a valid URL`);
            }
        }
        else if (this.type === ConditionRuleMatchType.RESPONSE_STATUS_CODE){
            try{
                //@ts-ignore
                fnValidate((match) => !isNaN(match) || new RegExp(match) );
            }
            catch(e){
                throw new Error(`Invalid condition ${this.toJSON()}. With RESPONSE_STATUS_CODE 'trigger', 'target' must be a valid integer`);
            }
        }
        else if (this.type === ConditionRuleMatchType.URL_CONTAINS){
            try{
                //@ts-ignore
                fnValidate((match) => typeof match === "string");
            }
            catch(e){
                throw new Error(`Invalid condition ${this.toJSON()}. With URL_CONTAINS 'trigger', 'target' must be a string`);
            }
        }
    }


    private makeExpression = (expression: (match: unknown) => boolean): boolean => {
        if (this.operator === "OR"){
            return this.match.some(expression);
        }
        else if (this.operator === "NOR"){
            return !this.match.some(expression);
        }
        else if (this.operator === "AND"){
            return this.match.every(expression);
        }

        else if (this.operator === "NAND"){
            return !this.match.every(expression);
        }
        else if (this.operator === "XOR"){
            return this.match.filter(expression).length === 1;
        }
        else if (this.operator === "NXOR"){
            return this.match.filter(expression).length !== 1;
        }
        return false;

    }

    /**
     * Determines whether the rule matches the event
     */
    public matches(event: HTTPEvent){

        // Verifies all matches in the case `this.match` is an Array
        const fnMatch = (expression: (match: unknown) => boolean) => this.makeExpression(expression);
        

        // this.match could be an Array, a string, a RegExp, or a number
        if (this.type === ConditionRuleMatchType.ENTIRE_URL){

            return fnMatch((match) => match === event.URL);
        }
        else if (this.type == ConditionRuleMatchType.RESPONSE_STATUS_CODE){
            const _target = event.response?.status;
            if (_target){
                // Use regex to match status code
                //@ts-ignore
                return fnMatch((match: any) => {
                    if (typeof match === "string"){
                        try{
                            return new RegExp(match).test(_target.toString());
                        }
                        catch(e){
                            console.log('Invalid RegExp', match);
                            //@ts-ignore
                            return match === _target;
                        }
                    }
                    else if (typeof match === "number"){
                        return match === _target;
                    }
                });
            }
            
        }

        else if (this.type === ConditionRuleMatchType.URL_CONTAINS){
            return fnMatch((match) => event.URL.includes(match as string));
        }

        else if (this.type === ConditionRuleMatchType.URL_REGEXP){
            return fnMatch((match) => new RegExp(match as string).test(event.URL));
        }

        return false;
        
    }


    private toJSON = () => {
        return JSON.stringify({
            type: this.type,
            match: this.match
        })
    }

}



export class HTTPRuleConditions implements IRuleConditionCollection{

    operator: TLogicalOperator;
    rules: HTTPRuleCondition[];

    constructor(operator: TLogicalOperator, rules: HTTPRuleCondition[]){ 
        this.operator = operator;
        this.rules = rules.map((_rule: IRuleConditionEntry )=> {
            if (_rule instanceof HTTPRuleCondition){
                return _rule;
            }
            else {
                return new HTTPRuleCondition(_rule.type, _rule.match, _rule.operator);
            }
        });
    }


    static isCollection(object: any): boolean{
        // Check whether operator and rules is present.
        return Array.isArray(object.rules)
    }



    matches = (target: HTTPEvent): boolean => {

        if (this.operator === "OR"){
            return this.rules.some(_rule => _rule.matches(target));
        }
        else if (this.operator === "NOR"){
            return !this.rules.some(_rule => _rule.matches(target));
        }
        else if (this.operator === "AND"){
            return this.rules.every(_rule => _rule.matches(target));
        }

        else if (this.operator === "NAND"){
            return !this.rules.every(_rule => _rule.matches(target));
        }
        else if (this.operator === "XOR"){
            return this.rules.filter(_rule => _rule.matches(target)).length === 1;
        }
        else if (this.operator === "NXOR"){
            return this.rules.filter(_rule => _rule.matches(target)).length !== 1;
        }
        return false;

    }
}


    // private makeConditions(cond: IRuleConditionEntry | IRuleConditionCollection){

        
    //           // If we receive an array of coonditions, we assume that the default operator is OR
    //     // In the other case, we assume that the operator is AND if the operator is not specified
    //     const isArray = Array.isArray(value)

    //     this._conditions = {
    //         //@ts-ignore
    //         rules: ( isArray ? value : [value]).map(_condition => new HTTPRuleCondition(...Object.values(_condition))),
    //         operator: isArray ? 'OR' : (value as IRuleConditionCollection).operator || 'AND'
    //     } as IRuleConditionCollection;
        
    // }]


    

