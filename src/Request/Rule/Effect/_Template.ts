
// import { HTTPEvent } from "../../Event";

// import { HTTPRulesCollection } from "../Collection";


// import { HTTPRuleEffectCollection } from "./Collection";
// import { HTTPEventEffectsManager } from "./Resolver";




// /**
//  * Manages HTTPEvents effects
//  */
// export class HTTPRulesTemplate{

//     ALLOWED_STATUS_CODES = new Set(
//         // An array ranging from 200 to 399
//         [...Array(200).keys()].map(i => i + 200)
//     )
    
//     constructor(
//         protected readonly rules: HTTPRulesCollection,
//         private readonly resolver = new HTTPEventEffectsManager(rules)
//         //private readonly observer = new HTTPEventObserver();
//     ){
//     }


//     /**
//      * Applies the template to the HTTP Event
//      * Subcribe to state changes and apply effects accordingly
//      */
//     apply = (obj: HTTPEvent) => {

//         const effects = this.resolver.resolve(obj);

//         for (const effect of effects.iterator()){
//             effect.apply(obj);
//         }
//     }


// }