

import { CookieHandler } from "../Cookies";
import { URLString } from "../types";
import { TRequestOptions, TGotRequestOptions } from "./types";
import { HTTPRequest, ResponseForRequest } from "puppeteer";

import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import got, { Method } from "got-cjs";





/**
 * Library to provide networking functionality to override Puppeteer HTTPRequest with GOT requests
 */
export class HTTPNetworking {

    public requestWith = async (request: HTTPRequest, _options:Partial<TRequestOptions> = {}) : Promise<Partial<ResponseForRequest>> => {

        
        /**
         * Fires a request using any method of choice
         * Returns a response to be used in Puppetteer's HTTPRequest.respond()
         */


        const cookieHandler = new CookieHandler(request);

        const options = await this.makeRequestOptions(request, {
            ..._options,
            cookieHandler
        });
        
        const response = await got(options);

        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
            await cookieHandler.setCookies(setCookieHeader);
            response.headers["set-cookie"] = undefined;
        }
        return {
            status: response.statusCode,
            headers: response.headers,
            body: response.body
        }
    }   

    private makeHeaders = (request: HTTPRequest) => {
        const headers: any = {
            ...request.headers(),
            //TODO: Shall we remove this?
            "host": new URL(request.url()).host
        }

        // Set "accept" header if not already set or undefined
        
        

        //"accept-encoding": "gzip, deflate, br",

        if (request.isNavigationRequest()) {
            headers["sec-fetch-mode"] = "navigate";
            headers["sec-fetch-site"] = "none";
            headers["sec-fetch-user"] = "?1";
        } else {
            headers["sec-fetch-mode"] = "no-cors";
            headers["sec-fetch-site"] = "same-origin";
        }
        return headers;
    }

    private makeProxyAgent = (proxy: URLString) => {
        if (proxy.startsWith("socks")) {
            return {
                http: new SocksProxyAgent(proxy),
                https: new SocksProxyAgent(proxy)
            };
        }
        return {
            http: new HttpProxyAgent(proxy),
            https: new HttpsProxyAgent(proxy)
        };
    }

    /**
     * Prepares GOT request option types
     */
    public makeRequestOptions = async (request: HTTPRequest, options: Partial<TRequestOptions> = {}) : Promise<TGotRequestOptions> => {
        
        
        // Request options for GOT accounting for overrides

        const self = this;

        return {
            cookieJar: await (options.cookieHandler as CookieHandler).getCookies(),
            method: request.method() as Method,
            body: request.postData(),
            headers: self.makeHeaders(request),
            agent: options.proxy ? self.makeProxyAgent(options.proxy) : undefined,
            responseType: "buffer" as "text",
            maxRedirects: 15,
            throwHttpErrors: false,
            ignoreInvalidCookies: true,
            followRedirect: false,
            url: request.url(),
        };

    }


    public defaultOptions = async (): Promise<Partial<TRequestOptions>> => {
        return {
            maxRedirects: 15,
            maxRetries: 1,
            throwHttpErrors: false,
            ignoreInvalidCookies: true,
            followRedirect: false,
            headers:{
                'accept-encoding': 'gzip, deflate, br',
                'accept':"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                'connection': 'keep-alive',
            }
        }
    }


}