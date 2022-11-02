


// Create a mock for HTTPEvent


import {jest} from '@jest/globals';


/**
 * Mocks HTTPRequest from library "puppeteer"
 */
const mockHTTPRequest = () => {
    jest.mock(
        "puppeteer",
        () => ({
            HTTPRequest: jest.fn().mockImplementation((options: any) => ({
                url: options.url || jest.fn().mockReturnValue(options?.url),
                method: options.method || jest.fn().mockReturnValue(options?.method),
                headers: options.headers || jest.fn().mockReturnValue(options?.headers),
                postData: options.postData || jest.fn().mockReturnValue(options?.postData),
                resourceType: options.resourceType || jest.fn().mockReturnValue(options?.resourceType),
                response: options.response && jest.fn().mockReturnValue(options.response)()
            }))
        })
    )
}

mockHTTPRequest();
import { HTTPRequest } from 'puppeteer';
import { TRequest } from '../../../src/Request/types';

export const makeHTTPRequest = (options: Partial<TRequest>) => {
    //@ts-ignore
    return new HTTPRequest(options);
}

