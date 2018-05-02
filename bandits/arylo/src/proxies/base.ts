import { sleep } from "../utils";

export class BassProxy {

    protected readonly RECONNECT_NUM = 10;
    protected readonly DISTANCE_TIME = 200;

    public async getUrls() {
        return [ ];
    }

    public async getMoney(addr: string): Promise<string[]> {
        return [ ];
    }

    public readonly start = async (index = 0): Promise<string[]> => {
        const set = new Set<string>();
        try {
            const addrs = await this.getUrls();
            for (const addr of addrs) {
                await sleep(this.DISTANCE_TIME);
                for (const m of await this.getMoney(addr)) {
                    set.add(m);
                }
            }
        } catch (error) {
            if (this.RECONNECT_NUM >= index) {
                return this.start();
            }
            throw error;
        }
        return [...set.values()];
    }

}
