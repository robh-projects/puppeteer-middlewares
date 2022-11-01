// Disable ts unused variable and imports checks


import {expect, beforeEach, it, describe, jest} from '@jest/globals';
import { IHTTPRule } from "../../../src/Request/Rule/types";
import { HTTPRulesCollection } from "../../../src/Request/Rule/Collection";
import { ConditionRuleMatchType } from "../../../src/Request/Rule/types";
import { HTTPRetryRule, HTTPRule } from '../../../src/Request/Rule/Rule';

import { makeHTTPEvent } from '../mocks/HTTPEvent.mock';

import { HTTPEvent } from '../../../src/Request/Event';
import { makeHTTPRequest } from '../mocks/HTTPRequest.mock';
import { TRequest } from '../../../src/Request/types';
import { HTTPRuleContextResolver } from '../../../src/Request/Rule/ContextResolver';
import { HTTP_STATE } from '../../../src/Request/Event/States';
import { HTTPEventRulesContext } from '../../../src/Request/Rule/Context';




beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
});

const rules: IHTTPRule[] = [
    {
        conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
        effects: {
            block: true,
            setHeaders: {
                'User-Agent': 'ACB'
            }
        },
        
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
            conditions: { match: [400], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
            effects:{
                proxy: 'http://cheapy:9999',
            }, 
            retryCount:3,
            retryRule: {
                // Backfalls to upper condition
                effects:{
                    setHeaders: {}
                }
            }
        }
    }
];

describe("Rules Context functionality is correct", () => {
    
    const rulesCollection = new HTTPRulesCollection(...rules);
    const rulesArray = Array.from(rulesCollection.iter());

    const event = new HTTPEvent(
        makeHTTPRequest({
            url() {
                return 'https://google.com';
            },
        }) as TRequest
    );

    const resolver = new HTTPRuleContextResolver(rulesCollection);

    const context = resolver.resolve(event);



    it("Should resolve the rules correctly", () => {
        expect(context).toBeDefined();
        expect(context.has(rulesArray[0])).toBe(true)
        expect(context.has(rulesArray[1])).toBe(true)
        expect(context.has(rulesArray[2])).toBe(false) // We still can't retry the event
    });
    
    

    it("Should apply the appropriate effects", () => {
        context.apply(event);

        expect(event.state).toBe(HTTP_STATE.BLOCKED);

        expect(event.options.proxy).toBe(rulesArray[1].effects.proxy);
        
        //@ts-ignore
        expect(event.options.headers['user-agent']).toBe(rules[1].effects.setHeaders['User-Agent']);

    });

    it("Should bypass when no rule match the event", () => {
        

        const event = new HTTPEvent(
            makeHTTPRequest({
                url() {
                    return 'https://google.com';
                },
            }) as TRequest
        );
        
        const resolver = new HTTPRuleContextResolver(
            new HTTPRulesCollection(
                {
                    conditions: { match: 'nevermatch', type: ConditionRuleMatchType.URL_CONTAINS },
                    effects:{
                        block: true
                    }
                },
                {
                    conditions: { match: 'nevermatch', type: ConditionRuleMatchType.URL_CONTAINS },
                    retryRule:{
                        conditions: { match: [400], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
                    }
                }
            )
        );
        const ctx = resolver.resolve(event);

        ctx.apply(event);

        expect(event.state).toBe(HTTP_STATE.TO_BYPASS);
        
    });

    
    it("Nested retry rules", () => {
        const event1 = new HTTPEvent(
            makeHTTPRequest({
                url() {
                    return 'https://google.com';
                },
            }) as TRequest
        );
        event1.addResponse({
            status: 400
        })

        var retryContext: HTTPEventRulesContext | undefined = undefined;

        // The same retry rule should be applied as many times as its retry count
        for (let i = 0; i < 3; i++) {
            retryContext = resolver.resolve(event1,retryContext);
            
            retryContext.apply(event1);

            expect(event1.options.proxy).toBe(rulesArray[2].effects.proxy);
            
            expect(event1.state).toBe(HTTP_STATE.TO_RETRY);
            

            // Previous options should be left unchanged
            //@ts-ignore
            expect(event1.options.headers['user-agent']).toBe(rules[1].effects.setHeaders['User-Agent']);

            event1.addResponse({
                status: 400
            })
    

        }

    });


    it("Nested retry rules inherit conditions from parent rules, while the context maintains its hierarchical integrity", () => {

        const rule: IHTTPRule = {
            retryRule:{
                // All statuses different than 200
                conditions: { match: 200, type: ConditionRuleMatchType.RESPONSE_STATUS_CODE, operator: 'NOR' },
                retryCount:2, // Retries with no effects
                retryRule:{ // At third retry, we should apply the effects
                    effects: {
                        proxy: 'http://localhost:8899',
                    },
                    retryRule:{
                        conditions: { match: 504, type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
                        retryCount:1
                    }
                }
            }
        }


        const event = new HTTPEvent(
            makeHTTPRequest({
                url() {
                    return 'https://google.com';
                },
            }) as TRequest
        );

        
        const coll = new HTTPRulesCollection(rule);
        const resolver = new HTTPRuleContextResolver(coll);
        const rulesInstances = Array.from(coll.iter());

        const ctx  = resolver.resolve(event);
        
        expect(ctx.retryHandle).toBeUndefined();

        event.addResponse({
            status: 400
        })

        const ctx1 = resolver.resolve(event,ctx).apply(event);
        expect(ctx1.retryHandle?.rule).toEqual(rulesInstances[0]); 
        expect(ctx1.retryHandle?.retriesLeft).toEqual(1); // Retries left 1

        event.addResponse({
            status: 503
        })
        const ctx2 = resolver.resolve(event,ctx1).apply(event);


        expect(ctx2.retryHandle?.rule).toEqual(rulesInstances[0]); // Retries left 0
        expect(ctx2.retryHandle?.retriesLeft).toEqual(0); 
        event.addResponse({
            status: 503
        })

        const ctx3 = resolver.resolve(event,ctx2).apply(event);
        
        expect(ctx3.retryHandle?.rule).toEqual(rulesInstances[1]); // New retry rule - Retries left 0 after applying
        expect(ctx3.retryHandle?.retriesLeft).toEqual(0); // Retries left 0


        event.addResponse({
            status: 505
        })

        const ctx4 = resolver.resolve(event,ctx3).apply(event);

        expect(ctx4.retryHandle).toBeUndefined(); // No more retries left

        expect(event.state).toBe(HTTP_STATE.RESPONSE_RECEIVED);

        // // event.addResponse({
        // //     status: 505
        // // })

        // const ctx5 = resolver.resolve(event,ctx4).apply(event);

        // expect(ctx5.retryHandle).toBeDefined(); // No more retries left

    });

    // TODO

    // it("Out-of-context rule effects do not override a retry context effect", () => {

    //     const rules: IHTTPRule[] = [
    //         {
    //             retryRule:{
    //                 // All statuses different than 200
    //                 conditions: { match: 200, type: ConditionRuleMatchType.RESPONSE_STATUS_CODE, operator: 'NOR' },
    //                 effects: {
    //                     proxy: 'http://incontext.com',
    //                 }
    //             },                
    //         },
    //         {
    //             effects: {
    //                 proxy: 'http://outcontext.com',
    //             }
    //         }
    //     ]


    //     const event = new HTTPEvent(
    //         makeHTTPRequest({
    //             url() {
    //                 return 'https://google.com';
    //             },
    //         }) as TRequest
    //     );

        
    //     const coll = new HTTPRulesCollection(...rules);
    //     const resolver = new HTTPRuleContextResolver(coll);
    //     const rulesInstances = Array.from(coll.iter());

    //     const ctx  = resolver.resolve(event);
        
    //     expect(ctx.retryHandle).toBeUndefined();

    //     event.addResponse({
    //         status: 400
    //     })

    //     const ctx1 = resolver.resolve(event,ctx).apply(event);

    //     expect(event.options.proxy).toBe('http://incontext.com');

        
    // });
    
    
});


