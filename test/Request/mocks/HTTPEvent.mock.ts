


// Create a mock for HTTPEvent


import {jest} from '@jest/globals';


const mockHTTPEvent = () => {
    jest.mock("../../../src/Request/Event", () => {
        return {
            //@ts-ignore
            HTTPEvent: jest.fn().mockImplementation((options: any) => {
                return {
                    request: options.request || jest.fn().mockReturnValue({
                        url: ()=> options?.url
                    }),
                    // ...new HTTPEvent(options.request || jest.fn().mockReturnValue({
                    //     url: ()=> options?.URL
                    // })),
                    URL: jest.fn().mockReturnValue(options.URL)(),
                    response: options.response && jest.fn().mockReturnValue(options.response)(),
                }
            })
        }
    });
}


mockHTTPEvent();
import { HTTPEvent } from '../../../src/Request/Event';

//@ts-ignore
export const makeHTTPEvent = (options): HTTPEvent => {
    //@ts-ignore
    return new HTTPEvent(options);
};


    // // Mock HTTPEvent
    

    // //@ts-ignore
    // _HTTPEvent.mockImplementation(({url}) => {
    //     return {
    //         request: jest.fn().mockReturnValue({
    //             url: ()=> url
    //         }),
    //         URL: jest.fn().mockImplementation(()=> url),
    //         options: {},
    //         eventEmitter: jest.fn().mockImplementation(() => {
    //             return null
    //         })
    //     }
    // });