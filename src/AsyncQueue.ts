

export class AsyncQueue<T> {
    private queue: T[] = [];
    private resolveQueue: ((value: T | PromiseLike<T>) => void)[] = [];

    push(item: T) {
        if (this.resolveQueue.length) {
            const resolve = this.resolveQueue.shift()!;
            resolve(item);
        } else {
            this.queue.push(item);
        }
    }

    async pop(): Promise<T> {
        if (this.queue.length) {
            return this.queue.shift()!;
        }
        return new Promise((resolve) => this.resolveQueue.push(resolve));
    }
}