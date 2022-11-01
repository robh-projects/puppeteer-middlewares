// Disable ts unused variable and imports checks


import {expect, test, it, describe} from '@jest/globals';
import { IHTTPRule } from "../../../src/Request/Rule/types";
import { HTTPRulesCollection } from "../../../src/Request/Rule/Collection";
import { ConditionRuleMatchType } from "../../../src/Request/Rule/types";
import { HTTPRetryRule } from '../../../src/Request/Rule/Rule';


import {HTTPRuleManager} from '../../../src/Request/Rule/Manager';
import { HTTPEvent } from '../../../src/Request/Event';
import { makeHTTPRequest } from '../mocks/HTTPRequest.mock';
import { TRequest, TResponse } from '../../../src/Request/types';
import { HTTP_STATE } from '../../../src/Request/Event/States';
import {jest} from '@jest/globals';
import { HTTP_EVENTS } from '../../../src/Request/Event/types';


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


describe("HTTPEventRuleManager works accordingly", () => {


    const rulesCollection: HTTPRulesCollection = new HTTPRulesCollection(...rules);


    it("Subscribes and unsubscribes to HTTP statuses changes effectively", () => {

        
        const manager = new HTTPRuleManager(rulesCollection);


        const event = new HTTPEvent(
            makeHTTPRequest({
                url() {
                    return 'https://google.com';
                },
                
            }) as TRequest
        );

        
        
        //@ts-ignore
        const spy = jest.spyOn(manager, 'onHTTPEventStatusChanged').mockResolvedValue(undefined);

        //@ts-ignore
        
        manager.watch(event);

        event.addResponse({
            status: 200,
        } as TResponse);

        // Expect manager.onHTTPEventStatusChanged to have been called


        expect(spy).toHaveBeenCalled();

    });

    
    
});


