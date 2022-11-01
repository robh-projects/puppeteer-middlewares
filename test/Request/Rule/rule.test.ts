// Disable ts unused variable and imports checks


import {expect, test, it, describe} from '@jest/globals';
import { IHTTPRule } from "../../../src/Request/Rule/types";
import { HTTPRulesCollection } from "../../../src/Request/Rule/Collection";
import { ConditionRuleMatchType } from "../../../src/Request/Rule/types";
import { HTTPRetryRule, HTTPRule } from '../../../src/Request/Rule/Rule';

//import { makeHTTPEvent } from '../mocks/HTTPEvent.mock';
import { HTTPEvent } from '../../../src/Request/Event';
import { makeHTTPRequest } from '../mocks/HTTPRequest.mock';
import { TRequest, TResponse } from '../../../src/Request/types';



const makeHTTPEvent = (URL:string): HTTPEvent => {
    return new HTTPEvent(
        //@ts-ignore
        makeHTTPRequest({
            url(){
                return URL
            }
        } as TRequest)
    );
};

const rules: IHTTPRule[] = [
    {
        conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
        effects: {
            block: true
        }
    },
    {
        effects: {
            proxy: 'http://localhost:8899',
            setHeaders: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
            }
        }
    },
    { // Validate recursive rules with no conditions
        
        retryRule:{
            conditions: {
                operator:"OR",
                rules:[{ match: [400], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE }]
            },
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


describe("Rules are initialzied correctly", () => {
    const rulesCollection: HTTPRulesCollection = new HTTPRulesCollection(...rules);

    it("Should initialize rules correctly", () => {
        


        const allRules = Array.from(rulesCollection.iter())

        expect(allRules[0].effects.block).toBe(true);

        //expect(allRules[1].effects.proxy).toBe(rules[1].effects.proxy);


    });


    it("Recursive retry rules should be initialized ", () => {
        


        const allRules = Array.from(rulesCollection.iter())

        let parentRule = allRules[2];
        while (parentRule.retryRule) {
            expect(parentRule.retryRule instanceof HTTPRetryRule).toBe(true);
            parentRule = parentRule.retryRule;
        }


    });    
    


    it("Should be able to iterate over them", () => {
        
        expect(Array.from(rulesCollection.iter()).length).toBe(4)


    });

    

    
    
});





describe("Rules match correctly", () => {
    const rulesCollection: HTTPRulesCollection = new HTTPRulesCollection(...rules);

    const rulesArray = Array.from(rulesCollection.iter());


   
    it("Should match individually", () => {
        
        expect(rulesArray[0].matches(makeHTTPEvent('https://google.com'))).toBe(true);
        expect(rulesArray[0].matches(makeHTTPEvent('https://gogle.com'))).toBe(false);
        expect(rulesArray[1].matches(makeHTTPEvent('https://google.com'))).toBe(true);
        expect(rulesArray[1].matches(makeHTTPEvent('https://gogle.com'))).toBe(true);
        


    });  
    
    it("Retry should only match if there is a response", () => {
        
        expect(rulesArray[3].matches(makeHTTPEvent("asd"))).toBe(false);



    });    
    
    
    it("Retry rules should match on conditions", () => {

        
        const event0 = makeHTTPEvent('').addResponse({
            status: 200
        } as TResponse)
        
        const event1 = makeHTTPEvent('').addResponse({
            status: 400
        } as TResponse)


        expect(rulesArray[2].matches(event0)).toBe(false);
        expect(rulesArray[2].matches(event1)).toBe(true);



    });    


    it("Retry rule will be applied only if the parent rule matches", () => {

        const event = new HTTPEvent(makeHTTPRequest({
            url() {
                return 'https://google.com';
            },
        })as TRequest )
        
        const rulesArray = Array.from(new HTTPRulesCollection({
            conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
            retryRule: {
                conditions: {
                    operator:"OR",
                    rules: [
                        { match: [400,300], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE},
                        { match: [500], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE }
                    ]
                },
                effects:{
                    proxy: 'http://localhost:8899',
                }
            }
        }).iter());

        expect(rulesArray[0].matches(event)).toBe(true);
        expect(rulesArray[1].matches(event)).toBe(false);



        event.addResponse({
            status: 300 
        } as TResponse)


        expect(rulesArray[1].matches(event)).toBe(true);

        event.addResponse({
            status: 500 
        } as TResponse)

        expect(rulesArray[1].matches(event)).toBe(true);

        event.addResponse({
            status: 501
        } as TResponse)

        expect(rulesArray[1].matches(event)).toBe(false);

    });    
    
    
    
});