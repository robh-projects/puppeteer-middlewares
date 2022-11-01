
import { HTTPRequest, ResponseForRequest } from "puppeteer";
import { CookieHandler } from "../Cookies";
import { URLString } from "../types";
import { OptionsOfTextResponseBody } from "got-cjs";


/**
 * Abstract Request and Response types used across the middleware domain
 */

export interface TRequest extends HTTPRequest{
    // Represents the Puppeteer HTTPRequest object that is received by the PageEventMiddleware
    

    makeRequest: (request: TRequest) => Promise<TResponse>;
}

export type TResponse = Partial<ResponseForRequest>






export type TGotRequestOptions = OptionsOfTextResponseBody

export interface TRequestOptions extends TGotRequestOptions {
    proxy?: URLString
    maxRetries: number
    headers: Record<string, string>
    cookieHandler: CookieHandler
}





