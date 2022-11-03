// Disable ts unused variable and imports checks


import {expect, test, it, describe} from '@jest/globals';
import { IHTTPRule } from "../../../../src/Request/Rule/types";
import { HTTPRulesCollection } from "../../../../src/Request/Rule/Collection";
import { ConditionRuleMatchType } from "../../../../src/Request/Rule/types";
import { HTTPRetryRule, HTTPRule } from '../../../../src/Request/Rule/Rule';

import {HTTPRuleEffectsRegistry} from '../../../../src/Request/Rule/Effect/Registry';

// import { mockHTTPEvent } from '../mocks/HTTPEvent.mock';
// mockHTTPEvent();
//import { HTTPEvent } from '../../../src/Request/Event';
import { HTTPRuleEffect } from '../../../../src/Request/Rule/Effect/Effect';
import { EFFECTS } from '../../../../src/Request/Rule/Effect/enum';

const rules: IHTTPRule[] = [
    {
        conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
        effects: {
            proxy: 'http://proxy1:8899',
            block: true
        }
    },
    {
        effects: {
            proxy: 'http://proxy2:8899',
            setHeaders: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
            }
        }
    },
    { // Validate recursive rules with no conditions
        
        retryRule:{
            conditions: { match: [400], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
            effects:{
                proxy: 'http://localhost:8899',
            }, 
            retryCount:3,
            retryRule: {
                effects:{
                    setHeaders: {}
                }
            }
        }
    }
];


describe("Effects are initialized correctly", () => {
    const rulesCollection: HTTPRulesCollection = new HTTPRulesCollection(...rules);

    
    const rulesArray = rulesCollection.array();

    it("Should initialize with {effect: keyof EFFECTS, sender: HTTPRule}", () => {
        

        const effect = HTTPRuleEffect.fromRule(rulesArray[0], EFFECTS.BLOCK).json()

        const expectancy = expect(
            effect
        );

        expectancy.toHaveProperty('effect', EFFECTS.BLOCK);
        expectancy.toHaveProperty('value', true);


    });
    
});


describe("Effect registry", () => {
    const rulesCollection: HTTPRulesCollection = new HTTPRulesCollection(...rules);

    
    const rulesArray = rulesCollection.array();

    const registry = new HTTPRuleEffectsRegistry();
    

    it("Should override effects in the correct order", () => {

        for (let i =0; i<2; i++) {
            const effect = HTTPRuleEffect.fromRule(rulesArray[i], EFFECTS.PROXY)
            registry.register(effect);

        }
        
        expect(registry.collection()).toHaveProperty('proxy', 'http://proxy2:8899');


    });
    
});

