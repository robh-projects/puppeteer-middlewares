


// Create a mock for HTTPEvent


import {jest} from '@jest/globals';
import { mockPartially } from './utils';
/**
 * Mocks HTTPEventHandler to void its functionalities
 */
const mockHTTPEventHandler = () => {
    // jest.doMock(
    //     "../../../src/Request/Event/Handler/Handler",
    //     () => {
    //     const original = jest.requireActual('../../../src/Request/Event/Handler/Handler');
    //     const mocks = original.get
    //     return {
    //         HTTPEventHandler: jest.fn().mockImplementation((options: any) => ({
    //             request: jest.fn().mockImplementation((...args)=> {}),
    //             abort: jest.fn().mockImplementation((...args)=> {}),
    //             respond: jest.fn().mockImplementation((...args)=> {}),
    //             continue: jest.fn().mockImplementation((...args)=> {}),
    //             handle: original.handle
    //         }))
    //     }}
    // )

    // return jest.mock(
    //     "../../../src/Request/Event/Handler/Handler",
    //     () => {
    //         const actual = jest.requireActual('../../../src/Request/Event/Handler/Handler')
    //         return {
    //             HTTPEventHandler: class {
    //                 request: jest.fn().mockImplementation((...args)=> {}),
    //                 abort: jest.fn().mockImplementation((...args)=> {}),
    //                 respond: jest.fn().mockImplementation((...args)=> {}),
    //                 continue: jest.fn().mockImplementation((...args)=> {}),
    
    //             }
    //         }
    //     }
    // )

    mockPartially(
        "../../../src/Request/Event/Handler/Handler",
        (actual) => {
            return {
                HTTPEventHandler: jest.fn().mockImplementation((options: any) => ({
                    request: jest.fn().mockImplementation((...args)=> {}),
                    abort: jest.fn().mockImplementation((...args)=> {}),
                    respond: jest.fn().mockImplementation((...args)=> {}),
                    continue: jest.fn().mockImplementation((...args)=> {}),
                    handle: actual.handle
                }))
            }
        }
    )
}

mockHTTPEventHandler();

import { HTTPEventHandler } from '../../../src/Request/Event/Handler/Handler';


export const makeHTTPEventHandler = () => {
    //@ts-ignore
    return new HTTPEventHandler();
}

