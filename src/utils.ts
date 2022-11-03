export const isUrl = (url: any) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}
/**
 * A blocking queue that replicates python queue
 */
 export class Queue{


    private queue: any[] = [];
    constructor(){
        this.queue = [];
    }

    /**
     * Put an item into the queue
     * @param {*} item 
     */
    put(item: any){
        this.queue.push(item);
    }
    /**
     * Get an item from the queue
     * @param {boolean} block 
     */
    async get(block=true){
        if(block){
            while(this.queue.length === 0){
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        return this.queue.shift();
    }
}