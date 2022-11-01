import { URLString } from "../../types";




export enum ConditionRuleMatchType{
    ENTIRE_URL = "ENTIRE_URL",
    URL_REGEXP = 'URL_REGEXP',
    URL_CONTAINS = 'URL_CONTAINS',
    RESPONSE_STATUS_CODE = 'RESPONSE_STATUS_CODE',

}


export type TRuleConditionMatch = string | RegExp | URL | number;

export type IRuleConditionEntry = {

    /**
     * Defines what triggers the rule: 'URL_REGEXP' or 'RESPONSE_STATUS_CODE'
     */
    type: ConditionRuleMatchType;
    /**
     * Defines the value of the trigger (e.g. the regexp to match an URL, or the status code)
     */
    match: TRuleConditionMatch | TRuleConditionMatch[];

    operator?: TLogicalOperator;
}

export type TLogicalOperator = "OR" | "AND" | "NOR" | "XOR" | "NAND" | "NXOR" | "XNOR";

export interface IRuleConditionCollection {
    operator: TLogicalOperator;
    rules: IRuleConditionEntry[]
}



/**
 * An collection of effects that can be applied to a request
 */
export interface IHTTPRuleEffects{
    
    proxy?: URLString | null;

    block?: boolean;

    retryRule?: IHTTPRetryRule;

    setHeaders?: Record<string, string> | ((headers: Record<string, string>) => Record<string, string>);
}


export type THTTPRuleEffectsCollection = {
    [P in keyof IHTTPRuleEffects]: IHTTPRuleEffects[P]

}

export type THTTPRuleConditions = IRuleConditionCollection | IRuleConditionEntry

export interface IHTTPRule{ 

    conditions?: THTTPRuleConditions;

    effects?: IHTTPRuleEffects;
    
    retryRule?: IHTTPRetryRule
}



export interface IHTTPRetryRule extends IHTTPRule{ 


    retryCount?: number;

    // Make effects required in retry rule, otherwise no point in building a "retry rule"
    effects?: IHTTPRuleEffects;
}






export type TRequestRuleCollection = IHTTPRule[];

export type TRuleEffectsCollection = IHTTPRuleEffects[];

export type THTTPRuleEffect = keyof IHTTPRuleEffects;