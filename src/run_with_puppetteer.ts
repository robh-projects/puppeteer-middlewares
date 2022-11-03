const puppeteer = require('puppeteer');
import {RequestMiddleware} from './/Request/Middleware';
import { ConditionRuleMatchType } from './/Request/Rule/types';

(
    async () => {
        const browser = await puppeteer.launch({
            
            headless: true,
        });
        const page = await browser.newPage();

        // set navigation timeout to infinite
        await page.setDefaultNavigationTimeout(0);
    
        new RequestMiddleware(
            {
                conditions: {
                    match: 'google.com',
                    type: ConditionRuleMatchType.URL_CONTAINS
                },
                effects:{
                    proxy: 'http://localhost:8899'
                },
                retryRule:{
                    // An empty retry rulle will match if the request fails for whatever reason
                    effects:{
                        proxy: null, // Will just void the request
                    }
                    
                }
            }
        ).bind(page);


        await page.goto('https://google.com');

        const awaitSleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        await awaitSleep(10000);
        await browser.close();
    }
)();