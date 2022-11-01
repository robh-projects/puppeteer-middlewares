import { Mixin } from 'ts-mixer';
import { HTTPRetryRule, HTTPRule } from '../Rule';
import { URLString } from '../../../types';
import { HTTPEvent } from '../../Event';
import {
    IHTTPRetryRule,
    IRuleConditionEntry,
    IRuleConditionCollection,
    IHTTPRuleEffects,
    TRuleEffectsCollection,
    THTTPRuleEffect,
} from '../types';
import { HTTPRuleEffectCollection } from './Collection';
import { HTTPRuleEffect } from './Effect';
import { EFFECTS } from './enum';
import { HTTPRuleEffectsCollectionSettersMixin } from './Mixins/CollectionSetters';

export * from './Effect';

/**
 * A registry of rule effect entries appliable to an HTTPEvent
 */
export class HTTPRuleEffectsRegistry {
    private entries = new Map<EFFECTS, HTTPRuleEffect>();

    register = (entry: HTTPRuleEffect) => {
        this.entries.set(entry.effect as EFFECTS, entry);
    };

    get = (effect: EFFECTS) => {
        return this.entries.get(effect);
    };

    has = (effect: EFFECTS) => {
        return this.entries.has(effect);
    };

    collection(): HTTPRuleEffectCollection {
        const valueOf = <T>(effect: EFFECTS) => {
            return this.entries.get(effect)?.value as T;
        };

        const _collectionData: IHTTPRuleEffects = {
            block: valueOf(EFFECTS.BLOCK),
            proxy: valueOf(EFFECTS.PROXY),
            setHeaders: valueOf(EFFECTS.SET_HEADERS),
        };

        return new HTTPRuleEffectCollection(_collectionData);
    }

    applySome(target: HTTPEvent, ...args: EFFECTS[]) {
        for (let effect of args) {
            this.get(effect)?.apply(target);
        }
    }
}
