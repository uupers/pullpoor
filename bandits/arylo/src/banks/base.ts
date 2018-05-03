import { sleep } from "../utils";

export abstract class BaseBank {

    protected readonly RECONNECT_NUM = 10;
    protected readonly DISTANCE_TIME = 200;
    protected skip = false;

    protected addrs: string[] = [ ];

    protected async getAddrs(): Promise<string[]> {
        return [ ];
    }

    protected async getMoney(addr: string): Promise<string[]> {
        return [ ];
    }

    public readonly start = async (index = 0): Promise<string[]> => {
        if (this.skip) {
            return [ ];
        }
        const set = new Set<string>();
        try {
            const addrs =
                this.addrs.length !== 0 ? this.addrs : await this.getAddrs();
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
