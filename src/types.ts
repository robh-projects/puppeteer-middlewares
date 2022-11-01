
//@ts-nocheck
export const map = {
    "[object Undefined]": "undefined",
    "[object Null]": "null",
    "[object Object]": "object",
    "[object Array]": "array", 
    "[object Boolean]": "boolean", 
    "[object Function]": "function", 
    "[object Number]": "number", 
    "[object BigInt]": "bigint", 
    "[object String]": "string", 
    "[object Symbol]": "symbol",
    // Typed arrays
    "[object Float32Array]": "array",
    "[object Float64Array]": "array",
    "[object Int8Array]": "array",
    "[object Int16Array]": "array",
    "[object Int32Array]": "array",
    "[object Uint8Array]": "array",
    "[object Uint8ClampedArray]": "array",
    "[object Uint16Array]": "array",
    "[object Uint32Array]": "array",
    "[object BigInt64Array]": "array",
    "[object BigUint64Array]": "array"
};

//@ts-ignore
export const type = (value) => {
    const type = Object.prototype.toString.call(value);
    //@ts-ignore
    return (map[type] === undefined) ? "object" : map[type];
}





export enum TAction {
    //ALLOW = 'ALLOW',
    FORWARD = 'FORWARD',
    BLOCK = 'BLOCK',
    RETRY   = 'RETRY',
}


export type TProxyAgent = {
    http: URL,
    https: URL,
    socks5: URL
}



export type URLString = string;