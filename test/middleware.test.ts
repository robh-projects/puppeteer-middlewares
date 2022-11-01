// Disable ts unused variable and imports checks


import {expect, test, it, describe} from '@jest/globals';
import { IHTTPRule } from "../src/Request/Rule/types";
import { HTTPRulesCollection } from "../src/Request/Rule/Collection";
import { ConditionRuleMatchType } from "../src/Request/Rule/types";
import { HTTPRetryRule } from '../src/Request/Rule/Rule';


import {HTTPRuleManager} from '../src/Request/Rule/Manager';
import { HTTPEvent } from '../src/Request/Event';
import { makeHTTPRequest } from './Request//mocks/HTTPRequest.mock';
import { TRequest, TResponse } from '../src/Request/types';
import { HTTP_STATE } from '../src/Request/Event/States';
import {jest, beforeEach} from '@jest/globals';
import { HTTP_EVENTS } from '../src/Request/Event/types';
import { HTTPEventHandler } from '../src/Request/Event/Handler/Handler';
import { HTTPEventHandleProvider } from '../src/Request/Event/Handler/Provider';
import { makeHTTPEventHandler } from './Request/mocks/HTTPEventHandler.mock';
import { EXCEPTIONS } from '../src/Request/Event/Exception';


jest.setTimeout(330000)

beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
});

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


describe("Test the whole integration", () => {

   
        
    

    it ("Should block the request, which results in calling request.abort", async () => {
         // Construct an HTTPEvent object
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );


        
        const rulesCollection = new HTTPRulesCollection({
            conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
            effects: {
                block: true
            }
        });

        const handleProvider = new HTTPEventHandleProvider(event); 
        const EventHandler: HTTPEventHandler = new HTTPEventHandler();
        const RulesManager = new HTTPRuleManager(rulesCollection);

        RulesManager.watch(event);
        
        const handleFn = jest.spyOn(EventHandler, 'handle');

        //@ts-ignore
        event.request.abort = jest.fn().mockImplementation(() => {});

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        expect(event.request.abort).toBeCalledTimes(1);
        expect(handleFn).toBeCalledTimes(1);

        
    });

    it ("Should bypass and call request.continue ", async () => {
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );

        const handleProvider = new HTTPEventHandleProvider(event); 
        const EventHandler: HTTPEventHandler = new HTTPEventHandler();
        const RulesManager = new HTTPRuleManager(
            new HTTPRulesCollection({
                conditions: { match: '89qwurejifwkmwoikeim,f', type: ConditionRuleMatchType.URL_CONTAINS },
                effects: {}
            })
        );

        RulesManager.watch(event);
        
        const handleFn = jest.spyOn(EventHandler, 'handle');

        //@ts-ignore
        event.request.continue = jest.fn().mockImplementation(() => {});

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        expect(event.request.continue).toBeCalledTimes(1);
        expect(handleFn).toBeCalledTimes(1);
        
    });


    it ("Should not call continue - Should override request because we have a retryRule, hence we need to intercept, wait for the response and retry if needed", async () => {
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );

        const handleProvider = new HTTPEventHandleProvider(event); 

        

        
        const requestSpy = jest.spyOn(HTTPEventHandler.prototype as any,'request');
        const respondSpy = jest.spyOn(HTTPEventHandler.prototype as any,'respond');

        const EventHandler: HTTPEventHandler = new HTTPEventHandler();

        requestSpy.mockImplementation((...args) => {
            event.addResponse({
                status: 400,
            })
        }); 
        
        respondSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });
        

        

        const RulesManager = new HTTPRuleManager(
            new HTTPRulesCollection({
                conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
                retryRule:{
                    conditions: { match: [400], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
                    retryCount:1,
                    effects:{
                        proxy: 'http://localhost:8899',
                    }
                },
            })
        );
            
        RulesManager.watch(event);
        
        



        //@ts-ignore
        event.request.continue = jest.fn().mockImplementation(() => {});
        

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        

        // Request should have been called twice, one for the initial request and one for the retry
        expect(requestSpy).toBeCalledTimes(2)
        expect(event.request.continue).toHaveBeenCalledTimes(0)
        expect(respondSpy).toHaveBeenCalledTimes(1)


        

    }); 
    
    
    
    it ("Calls continue, no conditions matching", async () => {
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );

        const handleProvider = new HTTPEventHandleProvider(event); 

        

        
        const requestSpy = jest.spyOn(HTTPEventHandler.prototype as any,'request');
        const respondSpy = jest.spyOn(HTTPEventHandler.prototype as any,'respond');
        const continueSpy = jest.spyOn(HTTPEventHandler.prototype as any,'continue');

        const EventHandler: HTTPEventHandler = new HTTPEventHandler();

        requestSpy.mockImplementation((...args) => {
            event.addResponse({
                status: 400,
            })
        }); 
        
        respondSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });

        continueSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });
        

        

        const RulesManager = new HTTPRuleManager(
            new HTTPRulesCollection({
                conditions: { match: 'unmatched', type: ConditionRuleMatchType.URL_CONTAINS },
                retryRule:{
                    // Won't matcch as we register response status 400
                    conditions: { match: [500], type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
                    effects:{
                        proxy: 'http://localhost:8899',
                    }
                },
            })
        );
            
        RulesManager.watch(event);
        
        



        //@ts-ignore
        
        

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        

        // Continue
        expect(requestSpy).toBeCalledTimes(0)
        expect(continueSpy).toHaveBeenCalledTimes(1)
        expect(respondSpy).toHaveBeenCalledTimes(0)

        

    }); 
    
    
    it ("Retry twice without proxy, retry once with proxy at last", async () => {
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );

        const handleProvider = new HTTPEventHandleProvider(event); 

        

        
        const requestSpy = jest.spyOn(HTTPEventHandler.prototype as any,'request');
        const respondSpy = jest.spyOn(HTTPEventHandler.prototype as any,'respond');
        const continueSpy = jest.spyOn(HTTPEventHandler.prototype as any,'continue');

        const EventHandler: HTTPEventHandler = new HTTPEventHandler();

        requestSpy.mockImplementation((...args) => {
            event.addResponse({
                status: 200,
            })
        }); 
        
        respondSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });

        continueSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });
        

        

        const RulesManager = new HTTPRuleManager(
            new HTTPRulesCollection({
                retryRule:{
                    // All statuses different than 200
                    conditions: { match: 200, type: ConditionRuleMatchType.RESPONSE_STATUS_CODE, operator: 'NOR' },
                    retryCount:2, // Retries with no effects
                    retryRule:{
                        effects: {
                            proxy: 'http://localhost:8899',
                        }
                    }
                },
            })
        );
            
        RulesManager.watch(event);
        
        



        //@ts-ignore
        
        

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        // Request will be invoked once
        expect(requestSpy).toBeCalledTimes(1)
        expect(continueSpy).toHaveBeenCalledTimes(0)
        expect(respondSpy).toHaveBeenCalledTimes(1)

        

    });


    it ("Should respond successfully", async () => {
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );

        const handleProvider = new HTTPEventHandleProvider(event); 

        

        
        const requestSpy = jest.spyOn(HTTPEventHandler.prototype as any,'request');
        const respondSpy = jest.spyOn(HTTPEventHandler.prototype as any,'respond');
        const continueSpy = jest.spyOn(HTTPEventHandler.prototype as any,'continue');

        const EventHandler: HTTPEventHandler = new HTTPEventHandler();

        requestSpy.mockImplementation((...args) => {
            event.addResponse({
                status: 400,
            })
        }); 
        
        respondSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });

        continueSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });
        

        

        const RulesManager = new HTTPRuleManager(
            new HTTPRulesCollection({
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
            })
        );
            
        RulesManager.watch(event);
        
        



        //@ts-ignore
        
        

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        

        // Request should have been called twice, one for the initial request and one for the retry
        expect(requestSpy).toBeCalledTimes(4)
        expect(continueSpy).toHaveBeenCalledTimes(0)
        expect(respondSpy).toHaveBeenCalledTimes(1)

        

    }); 
    
    
    it ("On error, respond with the latest known response, or bypass", async () => {
        const event = new HTTPEvent(
            makeHTTPRequest({
                url(){
                    return 'https://google.com';
                }
            }) as TRequest
        );

        const handleProvider = new HTTPEventHandleProvider(event); 

        

        
        const requestSpy = jest.spyOn(HTTPEventHandler.prototype as any,'request');
        const respondSpy = jest.spyOn(HTTPEventHandler.prototype as any,'respond');
        const continueSpy = jest.spyOn(HTTPEventHandler.prototype as any,'continue');

        const EventHandler: HTTPEventHandler = new HTTPEventHandler();

        requestSpy.mockImplementation((...args) => {
            event.setError(EXCEPTIONS.OVERRIDING_REQUEST,'Managed request');
        }); 
        
        respondSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });

        continueSpy.mockImplementation((...args) => {
            event.setState(HTTP_STATE.COMPLETED)
        });
        

        

        const RulesManager = new HTTPRuleManager(
            new HTTPRulesCollection({
              retryRule:{
                // All statuses different than 200
                    conditions: { match: 200, type: ConditionRuleMatchType.RESPONSE_STATUS_CODE, operator: 'NOR' },
                }
            })
        );
            
        RulesManager.watch(event);
        
        



        //@ts-ignore
        
        

        for await (const handle of handleProvider.generator()){
            EventHandler.handle(handle,event);
        }

        

        // Request should have been called twice, one for the initial request and one for the retry
        expect(requestSpy).toBeCalledTimes(1)
        expect(continueSpy).toHaveBeenCalledTimes(1)
        expect(respondSpy).toHaveBeenCalledTimes(0)

        

    });
    
    
});


