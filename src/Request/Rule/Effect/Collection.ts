
import { Mixin,  settings} from "ts-mixer";
import { HTTPRule } from "../Rule";

import {IHTTPRuleEffects} from "../types"
import { HTTPRuleEffect } from "./Effect";
import { EFFECTS } from "./enum";
import { HTTPRuleEffectsCollectionSettersMixin } from "./Mixins/CollectionSetters";




settings.initFunction = 'init';


export class HTTPRuleEffectCollection extends Mixin(HTTPRuleEffectsCollectionSettersMixin) implements IHTTPRuleEffects {



    constructor(
        protected readonly _effects: IHTTPRuleEffects,
    ){
        
        super(_effects);

        this.iterator = this.iterator.bind(this);

    }
    

    *iterator(keysOnly=false){
        if (!this._effects){
            const a = 2;
        }
        for (const [key, value] of Object.entries(this._effects)){
            if (value !== undefined){
                yield (!keysOnly ? [key, value] : key ) as [EFFECTS, typeof value];
            }
        }
    }

    


    /**
     * 
     */
    static fromRule = (rule: HTTPRule) => {
        return new HTTPRuleEffectCollection(rule.effects);
    }


    has = (effect:EFFECTS) => {
        for (const _effect of this.iterator(true)){
            //@ts-ignore
            if (_effect === effect){
                return true;
            }
        }
        return false;
    }
}

// Define a type as entries of EFFECTS enum
