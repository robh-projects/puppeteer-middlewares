import { TRequestOptions } from "../types";

export class RequestOptionsBase{

    protected options: TRequestOptions;


    constructor(options: TRequestOptions){
        this.options = options;
    }
}

