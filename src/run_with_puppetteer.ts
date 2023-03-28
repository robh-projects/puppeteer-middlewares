const puppeteer = require('puppeteer');
import {RequestMiddleware} from './/Request/Middleware';
import { ConditionRuleMatchType } from './/Request/Rule/types';

(
    async () => {
        const browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: false,
        });
        const page = await browser.newPage();

        // set navigation timeout to infinite
        await page.setDefaultNavigationTimeout(0);
    
        new RequestMiddleware(
            // {
            //     conditions: {
            //         match: 'google.com',
            //         type: ConditionRuleMatchType.URL_CONTAINS
            //     },
            //     effects:{
            //         proxy: 'http://localhost:8899'
            //     },
            //     retryRule:{
            //         // An empty retry rulle will match if the request fails for whatever reason
            //         effects:{
            //             proxy: null, // Will just void the request
            //         }
                    
            //     }
            // },
            {
                conditions: {
                    match: '.png',
                    type: ConditionRuleMatchType.URL_CONTAINS
                },
                effects:{
                    block: true
                },
            }
        ).bind(page);


        await page.goto('https://blackhatworld.com');
    }
)();