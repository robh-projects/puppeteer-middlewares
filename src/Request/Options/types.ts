
export namespace Fields{
    export type TSetHeaders = Record<string, string> | ((headers: Record<string, string>) => Record<string, string>);
    //export type TOverrideHeaders = TSetHeaders;
}

