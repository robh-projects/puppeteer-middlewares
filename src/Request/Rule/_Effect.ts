

import { HTTPRule } from "..";
import { HTTPEvent } from "../../Event";
import { HTTP_STATE } from "../../Event/States";

import { THTTPRuleEffect } from "../types";
import { EFFECTS } from "./enum";



    

// type Effect = EFFECTS.BLOCK | EFFECTS.BYPASS | EFFECTS.PROXY | EFFECTS.RETRY | EFFECTS.OVERRIDE_HEADERS;

export class HTTPRuleEffect{
    

    constructor(
        public readonly effect: THTTPRuleEffect,
        protected readonly sender: HTTPRule
    ){
    }

    get value(){
        //@ts-ignore
        return this.sender[this.effect];
    }


    fromRule = (rule: HTTPRule, effectKey: THTTPRuleEffect) => {
        //@ts-ignore
        return new HTTPRuleEffect(rule.effects[effectKey], rule);
    }



    apply(target: HTTPEvent, ...args: any[]){
        switch (this.effect){
            case EFFECTS.BLOCK:
                target.setState(HTTP_STATE.BLOCKED)
                break;
            case EFFECTS.PROXY:
                target.setProxy(this.value);
                break;
            case EFFECTS.SET_HEADERS:
                // effects.makeHeaders(sender.options.headers as Record<string, string>)
                target.setHeaders(
                    this.value
                );
                target.setHeaders(this.value);
                break
            case EFFECTS.RETRY:
                target.addRetry(args);
                break;
            default:
                break;
        }
    }

}

