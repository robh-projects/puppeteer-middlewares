import { nextTick } from "process";
import { HTTPEvent } from "..";
import { HTTP_STATE } from "../States";
import { HTTP_EVENTS, HTTP_EVENT_HANDLE } from "../types";
import { HTTPEventHandleResolver } from "./Resolver";

import {AsyncQueue} from "../../../AsyncQueue";

export class HTTPEventHandleProvider {
    private resolver: HTTPEventHandleResolver;
    private queue: AsyncQueue<HTTP_EVENT_HANDLE>;

    constructor(protected readonly event: HTTPEvent) {
        this.resolver = new HTTPEventHandleResolver();
        this.queue = new AsyncQueue();

        this.event.on(HTTP_EVENTS.RULES_APPLIED, () => {
            const handle = this.resolver.resolve(this.event)
            if (handle)
                this.queue.push(handle);
        });

        this.generator = this.generator.bind(this);
    }

    async *generator(): AsyncGenerator<HTTP_EVENT_HANDLE> {
        let handle;
        while ((handle = await this.queue.pop()) !== undefined) {
            yield handle as HTTP_EVENT_HANDLE;
        }
    }
}


