import { HTTPEvent } from ".";


export enum EXCEPTIONS {
    BLOCKED_BY_RULE,
    OVERRIDING_REQUEST
}

export class HTTPEventException extends Error {

    

    constructor(exception: EXCEPTIONS, public readonly sender:Error) {
        // Invoke super with the name of the exception enum key
        super(sender.message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HTTPEventException);
        }

        this.name = EXCEPTIONS[exception];
    }
}


