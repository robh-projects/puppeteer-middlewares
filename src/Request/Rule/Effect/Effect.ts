

import { HTTPRule } from "../Rule";
import { HTTPEvent } from "../../Event";
import { HTTP_STATE } from "../../Event/States";

import { THTTPRuleEffect } from "../types";
import { EFFECTS } from "./enum";



    

// type Effect = EFFECTS.BLOCK | EFFECTS.BYPASS | EFFECTS.PROXY | EFFECTS.RETRY | EFFECTS.OVERRIDE_HEADERS;

export class HTTPRuleEffect{
    

    constructor(
        public readonly effect: EFFECTS,
        private readonly sender: HTTPRule
    ){

        // Raise if effectKey is not a valid effect
        if (!sender.effects.has(effect)){
            throw new Error(`Invalid effect key: ${effect}`);
        }
    }

    get value(){
        //@ts-ignore
        return this.sender.effects[this.effect];
    }


    static fromRule = (rule: HTTPRule, effectKey: EFFECTS) => {
        return new HTTPRuleEffect(effectKey, rule);
    }



    apply(target: HTTPEvent, ...args: any[]){
        
        switch (this.effect){
            case EFFECTS.BLOCK:
                target.setState(HTTP_STATE.BLOCKED)
                break;
            case EFFECTS.PROXY:
                //@ts-ignore
                target.setProxy(this.value);
                break;
            case EFFECTS.SET_HEADERS:
                target.setHeaders(
                    //@ts-ignore
                    this.value(target.options.headers)
                );
                break
            default:
                break;
        }

        
    }


    json(){
        return {
            effect: this.effect,
            value: this.value
        }
    }

}

