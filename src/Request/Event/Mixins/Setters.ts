import { HTTPEventBase } from "../Base"; 
import { URLString } from "../../../types";
import { HTTP_STATE } from "../States";
import { EXCEPTIONS, HTTPEventException } from "../Exception";
import { TRequest, TRequestOptions } from "../../types";
import { HTTP_EVENTS } from "../types";




export class HTTPEventSettersMixin extends HTTPEventBase {

    constructor(
        public readonly request: TRequest,
        public readonly options: Partial<TRequestOptions> = {}
    )   {
        super(request,options);
    }


    setState(state: HTTP_STATE) {
        if (this.state === HTTP_STATE.BLOCKED && state !== HTTP_STATE.COMPLETED){
            return;
        }
        let prevState = this.state;
        this._state = state;
        this.emit(HTTP_EVENTS.STATE_CHANGED, prevState, state);
    }

    setProxy(proxy: URLString | null){
        this.options.proxy = proxy || undefined;
    }


    setHeaders(headers: Record<string,string>){
        this.options.headers = {
            ...this.options.headers || {},
            ...headers
        }
    }


    private errors: HTTPEventException[] = []

    public raiseError(){
        // Compile an exception
        // let msg = "";
        // for (let error of this.errors){
        //     msg += error.message + '\n';
        // }
        throw this.errors[0];
    }

    setRequestFailed(e: EXCEPTIONS, args: any){
        this.errors.push(
            new HTTPEventException(e,args)
        );
        console.log(args);
        this.setState(HTTP_STATE.REQUEST_ERRORED);
        this.emit(HTTP_EVENTS.REQUEST_FAILED, this);
    }

}