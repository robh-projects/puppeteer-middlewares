export class CDP {
    Network: { getCookies(urls: any): Promise<any>; setCookies(cookies: any): Promise<void>; deleteCookies(cookies: any): Promise<void>; };


    constructor(client: { send: (arg0: string, arg1: any) => any; }) {
        // Network domain: https://chromedevtools.github.io/devtools-protocol/1-3/Network/
        this.Network = {
            async getCookies(urls: any) {
                return (await client.send("Network.getCookies", urls)).cookies;
            },
            async setCookies(cookies: any) {
                await client.send("Network.setCookies", cookies);
            },
            async deleteCookies(cookies: any) {
                await client.send("Network.deleteCookies", cookies);
            }
        }
    }
}

