import { HTTPRequest, Page } from "puppeteer";
import { IPageEventMiddleware } from "../Middleware";

import { HTTPRequestManager } from "./Manager";

import { TRequest } from "./types";

import { HTTPRulesCollection, HTTPRulesCollection as RulesCollection } from "./Rule/Collection";
import { IHTTPRule, TRequestRuleCollection } from "./Rule/types";
import { HTTPRule } from "./Rule/Rule";

export class RequestMiddleware implements IPageEventMiddleware{
    id = Math.random().toString(36);

    protected manager: HTTPRequestManager;

    public rules: RulesCollection;

    constructor(
        ...rules: IHTTPRule[]
    ){
        this.rules  = new HTTPRulesCollection(...(rules ? (Array.isArray(rules) ? rules : [rules]).map(_rule => new HTTPRule(_rule)) : []) as TRequestRuleCollection);

        this.manager = new HTTPRequestManager(this)
    }


    public handler = async (_request: HTTPRequest) : Promise<void> => {
        const PROTOCOL = _request.url().split(":")[0];
        // If the protocol is not http or https, we currently can't handle it
        
        const request = (_request as TRequest);

        if (PROTOCOL !== "http" && PROTOCOL !== "https"){
            // TODO: Move this to default rule config.
            request.continue();
        }
        
        await this.manager.process(
            request as TRequest
        );
        
    }

    
    


    bind = (page: Page) => {
        const self = this;
        const USE_PROXY_PER = {
            // Call this if request object passed
            //@ts-ignore
            HTTPRequest: async (request, proxy) => {
                let overrides;
                // Skip request if proxy omitted
                // @ts-ignore
                if (proxy) {await self.handler(request, proxy, overrides)}
                else {request.continue(overrides)}
            },
            //@ts-ignore
            // Call this if page object passed
            CDPPage: async (page: Page) => {
                await page.setRequestInterception(true);
                //const listener = "$ppp_requestListener";

                // const f = {[listener]: async (request: HTTPRequest) => {
                //     await self.handler(request);
                // }};
                
                //removeRequestListener(page, listener);
                
                page.on("request", self.handler)

                // else {await page.setRequestInterception(false)}
            }
        }
        //@ts-ignore
        return (USE_PROXY_PER[page.constructor.name] || USE_PROXY_PER['CDPPage'])(page);
    }
}



