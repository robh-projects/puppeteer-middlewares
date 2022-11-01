# Puppetteer Middlewares
A library that provides rule-based middlewares for Puppetteer page events.

### Installation 

- #### Using NPM (coming soon)
  ```npm i puppetteer-middlewares```
- #### From source
  ```
  git clone https://github.com/teocns/puppetteer-middlewares/
  cd puppetteer-middlewares
  npm install && npm run build
  ```
  
---
## Request Middleware


Quick-run:


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

