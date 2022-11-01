import { HTTPEvent } from "../../Event";
import { HTTPRuleEffect } from "./Effect";




/**
 * Provides context upon an effect applied to a given rule
 */
export class HTTPRuleEffectContext{
    constructor(
        public readonly effect: HTTPRuleEffect,
        public readonly event: HTTPEvent
    ){

    }
}