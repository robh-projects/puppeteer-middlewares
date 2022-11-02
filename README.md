# Puppetteer Middlewares
A library that currently implements rule-based Request Middlewares for Puppetteer page events.

You can conditionally proxify, block, retry, or just override request options!

### Installation 

- #### Using NPM
  ```npm i @teocns/puppeteer-middlewares```
- #### From source
  ```
  git clone https://github.com/teocns/puppetteer-middlewares/
  cd puppetteer-middlewares
  npm install && npm run build
  ```
### Running tests

  - `npm run test` makes use of Jest to run all tests placed under `/test`

---
## Request Middleware


### ⚡ Usage

```
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

```


### ❓ How to build rules

Each rule are dictionary objects made of `conditions` and `effects`. 

##### Example
```
{
  conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
  effects: {
      proxy: 'http://localhost:8899',
      setHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
      }
  }
}
```
#### Available Condition types

```
ENTIRE_URL
URL_REGEXP
URL_CONTAINS
RESPONSE_STATUS_CODE
```
----
####  Logical Operators
- Conditions implement the logical `operator` property whose values can be either of `"OR" | "AND" | "NOR" | "XOR" | "NAND" | "NXOR" | "XNOR"`.

- The **default** operator is `OR`.

- ❗Note: you must use a valid javascript **RegExp** string

##### Usage


  <sub>Matches **everything starting with** `https://` and ending with either `.com` or `.net`</sub>  
  ```
  conditions: {
      operator: 'OR',
      match: ['^https://.+.com$', '^https://.+.net$'],
      type: ConditionRuleMatchType.URL_REGEXP,
  }
  ```

  
  <sub>Match **status codes** different than 200 </sub>

  ```
  conditions: {
      operator: 'NOR'
      match: 200,
      type: ConditionRuleMatchType.URL_REGEXP,
  }
  ```
---

#### Effects


- `block` Will block the request
- `proxy` proxifies the request. Provide an URL string
- `setHeaders` will override request headers

##### Examples

<sub>Override **headers** and use a **proxy** for all requests containing `google.com` in the URL</sub>
```
{
  conditions: { match: 'google.com', type: ConditionRuleMatchType.URL_CONTAINS },
  effects: {
      proxy: 'http://localhost:8899',
      setHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
      }
  }
}
```
<sub>**Block** all requests matching `https://undesired.com`</sub>
```
{
  conditions: { match: 'https://undesired.com', type: ConditionRuleMatchType.ENTIRE_URL},
  effects: {
      block:true
  }
}
```
---
### ♻️ Retry rules

You can conditionally retry requests with specified effects

##### Usage

In this example, the flow is:
- Will retry 3 times with a `cheap-proxy`, if the status code is `5xx`
- Will retry 1 time with an `expensive-proxy`
```
{ 
  retryRule:{
      conditions: { match: '^5\\d{2}$', type: ConditionRuleMatchType.RESPONSE_STATUS_CODE },
      effects:{
          proxy: 'http://cheap-proxy:8899',
      }, 
      retryCount:3,
      retryRule: {
          effects:{
              proxy: 'http://expensive-proxy:8899'
          }
      }
  }
}
```

