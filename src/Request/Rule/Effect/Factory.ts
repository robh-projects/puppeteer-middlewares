import { IHTTPRuleEffects, THTTPRuleEffectsCollection } from '../types';

export class HTTPRuleEffectFactory {
    static effectsFromRule = (
        rule: IHTTPRuleEffects
    ): THTTPRuleEffectsCollection => {
        const effects: THTTPRuleEffectsCollection = {};
        for (const [key, value] of Object.entries(rule)) {
            if (value !== undefined) {
                //@ts-ignore
                effects[key] = value;
            }
        }
        return effects;
    };
}
