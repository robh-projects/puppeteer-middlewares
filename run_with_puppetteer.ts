const puppeteer = require('puppeteer');
import {RequestMiddleware} from './src/Request/Middleware';
import { ConditionRuleMatchType } from './src/Request/Rule/types';

(
    async () => {
        const browser = await puppeteer.launch({
            headless: false,
        });
        const page = await browser.newPage();

        
    
        new RequestMiddleware(
            {
                conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
                effects:{
                    proxy: 'http://localhost:8899',
                }
            }
        ).bind(page);


        await page.goto('https://google.com');

        const awaitSleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        await awaitSleep(10000);
        await browser.close();
    }
)();