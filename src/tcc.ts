//@ts-nocheck
// import {launch} from "puppeteer";
// import { RequestMiddleware } from "./Request/Middleware";
// import { RequestRule } from "./Request/Rule";
// import { RulesContext } from "./Request/Rule/Context";
//import { IHTTPRule } from "./Request/Rule/types";



// const run = async () => {
//     const b = await launch({
//         headless:false,
//     })
//     const p = await b.newPage();

//     const rm = new RequestMiddleware();


//     rm.bind(p);


//     p.goto("https://www.google.com");
// }



// const testAlgo = ()=> {

//     const rules: IRequestMiddlewareRule = [
//         {
//             condition: { match: 'google.com', target: 'URL_CONTAINS' },
//             block: true
//         },
//         {
//             condition: { match: 'google.com', target: 'URL_CONTAINS' },
//             retry: [
//                 {
//                     condition: {

//                     }
//                 }
//             ]
//         }
//     ];

//     //@ts-ignore
//     RulesContext.provider.getContext(rules.map(_rule => new RequestRule(_rule)));
// }

// run().then()


// const fn = function*() {
//     const arr = [1,2,3,4,5,6,7,8,9,10];

//     for (let i of arr){
//         yield i;
//     }
// }


// const gen = fn();
// for (let i of gen){
//     console.log(i);
// }





const rules: IHTTPRule = [
    {
        condition: { match: 'google.com', target: 'URL_CONTAINS' },
        block: true
    },
    {
        condition: '*',
        proxy: 'http://localhost:8899',
        overrideHeaders: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
        },
        addHeaders: {
            'X-Test': 'test'
        }
    },
    {
        condition: { match: '.js', target: 'URL_CONTAINS',  invert: true },
        proxy: null
    },
    {
        condition: { match: 'test.com', target: 'URL_CONTAINS' },
        effects: {
            setHeaders: {
            },
            retryRule:{
                maxRetries: 2
                

                
                
            }
        },
        
        retry:{
            proxy: 'http://localhost:8899',
            overrideHeaders: (headers) => {
            },
            retryCount: 3,
            retryDelay: 1000,
            // Will retry 3 times with 1 second delay, before continuing with another retry rule
            retry: {
                overrideHeaders: undefined,
                proxy: 'http://expensiveproxy',
            }
        }
    }
];