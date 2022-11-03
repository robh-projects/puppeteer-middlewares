import { HTTPRetryRule, HTTPRule } from "../../Rule";
import { URLString } from "../../../../types";
import { IHTTPRetryRule, IRuleConditionEntry, IRuleConditionCollection, IHTTPRuleEffects, TRuleEffectsCollection } from "../../types";






/**
 * A collection of effect entries appliable to an HTTPEvent
 */
export class HTTPRuleEffectsCollectionSettersMixin implements IHTTPRuleEffects{
    

    private _setHeaders?: (headers: Record<string, string>) => Record<string, string> | Record<string,string>;
    

    

    constructor(
        protected readonly _effects: IHTTPRuleEffects = {},
    ){
        this.block = Boolean(_effects.block);
        this.proxy = _effects.proxy;
        if (_effects.retryRule)
            this.retryRule = _effects.retryRule;


        //@ts-ignore
        this._setHeaders = _effects.setHeaders;
    }
    // /**
    //  * https://www.npmjs.com/package/ts-mixer#dealing-with-constructors
    //  */
    // protected init(_effects: IHTTPRuleEffects){
    //     this._setHeaders = _effects.setHeaders;
    // }

    public setHeaders = (headers:Record<string,string>): Record<string, string> => {

        let appliableHeaders = {};
        if (typeof this._setHeaders === "function"){
            // Make sure setHeaders callable has one parameter
            if (this._setHeaders.length !== 1){
                throw new Error("setHeaders callable must have one parameter");
            }
            appliableHeaders = this._setHeaders(headers);

        }
        else if (typeof this._setHeaders === "object"){
            appliableHeaders = this._setHeaders;
        }
        else{
            throw new Error("setHeaders must be a callable or an object");
        }
        

        return {
            ...headers,
            // All keys to lowercase
            ...(Object.keys(appliableHeaders).reduce((acc, key) => {
                //@ts-ignore
                acc[key.toLowerCase()] = appliableHeaders[key];
                return acc;
            }, {}))
        }
    }

    
    public block: boolean = false;

    private _proxy: URLString | undefined | null;

    set proxy(value: URLString | undefined | null) {
        if (value === undefined) 
            return;
        else if (value === null){
            this._proxy = undefined;
        }
        else{
            try{
                new URL(value as string);
                this._proxy = value;
            }
            catch(e){
                throw new Error(`Invalid proxy URL: ${value}`);
            }
        }
       
    }

    get proxy(): URLString | undefined | null {
        return this._proxy;
    }

    set retryRule(value: IHTTPRetryRule){
        // Create recursively
        this.retryRule = new HTTPRetryRule(value)
    }



    



    // set conditions(value: IRuleConditionEntry | IRuleConditions) {
    //     //@ts-ignore

    //     this.condition = value;

    //     // If we receive an array of coonditions, we assume that the default operator is OR
    //     // In the other case, we assume that the operator is AND if the operator is not specified
    //     const isArray = Array.isArray(value)

    //     this.conditions = {
    //         //@ts-ignore
    //         rules: ( isArray ? value : [value]).map(_condition => new RuleConditionEntry(...Object.values(_condition))),
    //         operator: isArray ? 'OR' : (value as IRuleConditions).operator || 'AND'
    //     };
        
        
    // } 

}