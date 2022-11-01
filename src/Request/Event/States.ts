
export enum HTTP_STATE  {
    // First absolute state
    REQUESTING = "REQUESTING",

    // A response has been registered
    RESPONSE_RECEIVED = 'RESPONSE_RECEIVED',
    
    // Request needs retrial
    TO_RETRY = 'TO_RETRY',

    // Rules have blocked the event
    BLOCKED = 'BLOCKED',


    COMPLETED = 'COMPLETED',


    // Request failed for whatever reason.
    ERRORED = 'ERRORED',


    // Dead-end.
    FATAL = 'FATAL',

    // Bypass the handling of the event and default to standard behavior
    TO_BYPASS = 'TO_BYPASS'
}
