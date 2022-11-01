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




describe("HTTPEvent states are correctly assigned", () => {

  
    it("BLOCK state will not change unless if COMPLETED", () => {

        const event = new HTTPEvent(
            makeHTTPRequest({
                url() {
                    return 'https://google.com';
                },
                
            }) as TRequest
        );
        
        event.setState(HTTP_STATE.BLOCKED);
        
        event.addResponse({
            status:200,
            body: 'Hello world',
        })

        expect(event.state).toBe(HTTP_STATE.BLOCKED);
        
    }); 



    
    
});


