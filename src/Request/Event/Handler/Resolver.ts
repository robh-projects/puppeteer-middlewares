import { HTTPEvent } from "..";
import { EFFECTS } from "../../Rule/Effect/enum";
import { HTTPEventException } from "../Exception";

import { HTTP_STATE } from "../States";

import { HTTP_EVENT_HANDLE } from "../types";







/**
 * Resolves to an HTTPEvent handle
 */
export class HTTPEventHandleResolver{


    //rules?: HTTPRulesTemplate = undefined;

    constructor(
    ){

    }


    resolve = (event: HTTPEvent): HTTP_EVENT_HANDLE | undefined => {
        switch (event.state){
            case HTTP_STATE.BLOCKED:
                return HTTP_EVENT_HANDLE.ABORT;
            case HTTP_STATE.RESPONSE_RECEIVED:
                return HTTP_EVENT_HANDLE.RESPOND;
            case HTTP_STATE.TO_RETRY:
                // Perform retry on response error
                return HTTP_EVENT_HANDLE.RETRY
            case HTTP_STATE.REQUESTING:
                return HTTP_EVENT_HANDLE.REQUEST;
            case HTTP_STATE.TO_BYPASS:
                return HTTP_EVENT_HANDLE.CONTINUE;
            case HTTP_STATE.REQUEST_ERRORED:
                if (event.response)
                    return HTTP_EVENT_HANDLE.RESPOND;
                else    
                    return HTTP_EVENT_HANDLE.CONTINUE;
            default:
                return undefined;
        }

        
    }


    /////


}