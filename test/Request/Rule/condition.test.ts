// Disable ts unused variable and imports checks

import { expect, test, it, describe } from '@jest/globals';
import { makeHTTPEvent } from '../mocks/HTTPEvent.mock';


import { IHTTPRule } from '../../../src/Request/Rule/types';
import { ConditionRuleMatchType } from '../../../src/Request/Rule/types';
import { HTTPRule } from '../../../src/Request/Rule/Rule'; 
import {
    HTTPRuleCondition,
    HTTPRuleConditions,
} from '../../../src/Request/Rule/Condition';

import { HTTPEvent } from '../../../src/Request/Event';

const rules: IHTTPRule[] = [
    {
        // Rule 1
        conditions: {
            match: ['https://google.com', 'https://verycom'],
            type: ConditionRuleMatchType.ENTIRE_URL,
        },
        effects: {
            block: true,
        },
    },
    {
        // Rule 2
        conditions: {
            operator: 'OR',
            // Match everything starting with https:// and ending with either .com or .net
            match: ['^https://.+.com$', '^https://.+.net$'],
            type: ConditionRuleMatchType.URL_REGEXP,
        },
        effects: {
            block: true,
        },
    },
    {
        // Rule 3
        conditions: {
            match: ['google.com'],
            type: ConditionRuleMatchType.URL_CONTAINS,
        },
        effects: {
            block: true,
        },
    },
    {
        // Rule 4
        conditions: {
            match: [200, 400, '^5\\d{2}$'], // Match all 5xx status codes
            type: ConditionRuleMatchType.RESPONSE_STATUS_CODE,
        },
        effects: {
            block: true,
        },
    },
    { // Rule 5
        conditions: {
            match: ['2\\d{2}$'], // Match everything else than 2xx
            type: ConditionRuleMatchType.RESPONSE_STATUS_CODE,
            operator: 'NAND',
        },
    }
];

describe('Test that the collection gets properly initialized', () => {
    const rule0 = new HTTPRule(rules[0]);

    it('Conditions should be an object { operator, rules }', () => {
        expect(rule0.conditions).toBeInstanceOf(HTTPRuleConditions);

        // expect(rule0.conditions).toHaveProperty('operator');
        // expect(rule0.conditions).toHaveProperty('conditions');
        // expect(rule0.conditions?.rules).toBeInstanceOf(Array);
    });

    it('Operator needs to default to OR', () => {
        expect(rule0.conditions?.operator).toBe('OR');
    });

    it('Conditions should be an array of HTTPRuleCondition', () => {
        expect(rule0.conditions?.rules).toBeInstanceOf(Array);
        expect(rule0.conditions?.rules[0]).toBeInstanceOf(HTTPRuleCondition);
    });
});

describe('Test that conditions match targets', () => {
    
    const rule1 = new HTTPRule(rules[0]);
    const rule2 = new HTTPRule(rules[1]);
    const rule3 = new HTTPRule(rules[2]);
    const rule4 = new HTTPRule(rules[3]);
    const rule5 = new HTTPRule(rules[4]);

    it('Should match entire URL', () => {
        expect(
            rule1.conditions?.matches(
                makeHTTPEvent({ URL: 'https://google.com' })
            )
        ).toBe(true);
        expect(
            rule1.conditions?.matches(
                makeHTTPEvent({ URL: 'https://gogle.com' })
            )
        ).toBe(false);
    });

    it('Should match REGEX on URL', () => {
        expect(
            rule2.conditions?.matches(
                makeHTTPEvent({ URL: 'https://google.com' })
            )
        ).toBe(true);
        expect(
            rule2.conditions?.matches(
                makeHTTPEvent({ URL: 'https://gogle.it' })
            )
        ).toBe(false);
        expect(
            rule2.conditions?.matches(makeHTTPEvent({ URL: 'ftp://gogle.it' }))
        ).toBe(false);
    });

    it('Should match URL_CONTAINS on URL', () => {
        expect(
            rule3.conditions?.matches(
                makeHTTPEvent({ URL: 'https://google.com' })
            )
        ).toBe(true);
        expect(
            rule3.conditions?.matches(
                makeHTTPEvent({ URL: 'https://gogle.it' })
            )
        ).toBe(false);
    });

    it('Should match RESPONSE_STATUS_CODE on URL', () => {
        expect(
            rule4.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 200 },
                })
            )
        ).toBe(true);

        expect(
            rule4.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 404 },
                })
            )
        ).toBe(false); 
        
        expect(
            rule4.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 503 },
                })
            )
        ).toBe(true);
    });
    
    it('Should match everything else than status 200', () => {
        expect(
            rule4.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 200 },
                })
            )
        ).toBe(true);

        expect(
            rule4.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 404 },
                })
            )
        ).toBe(false); 
        
        expect(
            rule5.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 403 },
                })
            )
        ).toBe(true);        
        
        
        expect(
            rule5.conditions?.matches(
                makeHTTPEvent({
                    URL: 'https://google.com',
                    response: { status: 203 },
                })
            )
        ).toBe(false);
    });
});
