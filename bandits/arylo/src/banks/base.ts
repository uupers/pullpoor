import * as path from 'path';
import { URL } from 'url';
import stackTrace = require('stack-trace');
import isUrl = require('is-url');
import debug = require('debug');
import { sleep, date } from '../utils';
import { dbMemery } from '../db';
import * as lodash from 'lodash';

export interface Banknote {
    /** 编码 */
    id: string;
    /** 生产日期 */
    createdAt: number;
}

export class Store {
    /** 有效时间 */
    private readonly VALID_PERIOD = date.d(3);
    private source: string;
    /** 票库记录列表 */
    private list: Banknote[] = [ ];
    private updatedAt = 0;

    constructor(source: string) {
        this.source = source;
        try {
            // 加载旧记录
            const obj = dbMemery.get('banks').get(source).value();
            this.list = obj.list;
            this.updatedAt = obj.updatedAt;
        } catch (error) { }
    }

    private brokenFakeBanknote() {
        const now = Date.now();
        lodash.remove(this.list, (m) => {
            return (m.createdAt + this.VALID_PERIOD) < now;
        });
    }

    public add(ids: string[] = [ ]) {
        this.brokenFakeBanknote();
        const banknoteSet = new Set<string>(
            lodash.flatMap(this.list, (obj) => obj.id)
        );
        const newBanknotes = ids.filter((m) => !banknoteSet.has(m));
        if (newBanknotes.length === 0) {
            return this;
        }
        this.updatedAt = Date.now();
        this.list.push(...lodash.map(newBanknotes, (m) => {
            return { id: m, createdAt: this.updatedAt };
        }));
        this.save();
        return this;
    }

    public get() {
        return {
            source: this.source,
            list: this.list,
            updatedAt: this.updatedAt,
            length: this.list.length
        };
    }

    private save() {
        dbMemery.get('banks').set(this.source, this.get()).write();
    }
}

export abstract class BaseBank {

    protected readonly RECONNECT_NUM = 10;
    protected readonly DISTANCE_TIME = 200;
    /** 行名 */
    protected readonly NAME = this.getName();

    private log = debug(`bandits:banks:${this.NAME}`);
    protected skip = false;
    /** 地址 */
    protected addrs: string[] = [ ];
    /** 票库 */
    protected store = new Store(this.NAME);
    protected expiredAt = date.m(5);

    private getName() {
        const trace = stackTrace.get();
        // 0: BaseBank.getName
        // 1: class BaseBank
        // 2: child class
        const filename = trace[2].getFileName()
        return path.basename(filename).replace(/\.[tj]s$/, '');
    }

    protected getAddrs(): PromiseLike<string[]> {
        return Promise.resolve([ ]);
    }

    protected getBanknotes(addr: string): PromiseLike<string[]> {
        return Promise.resolve([ ]);
    }

    private async runGetAddrs(index = 0): Promise<string[]> {
        try {
            return await this.getAddrs();
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.runGetAddrs(++index);
            }
            return [ ];
        }
    }

    private async runGetBanknotes(addr: string, index = 0): Promise<string[]> {
        try {
            return await this.getBanknotes(addr);
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.runGetBanknotes(addr, ++index);
            }
            return [ ];
        }
    }

    public readonly start = async (index = 0): Promise<Store> => {
        if (this.skip) {
            this.log('Skip');
            return this.store;
        }
        if ((Date.now() - this.store.get().updatedAt) <= this.expiredAt) {
            this.log('Use Cache');
            return this.store;
        }
        const list: string[] = [ ];
        try {
            const addrs =
                this.addrs.length !== 0 ? this.addrs : await this.runGetAddrs();
            for (const addr of addrs) {
                await sleep(this.DISTANCE_TIME);
                const notes = (await this.runGetBanknotes(addr))
                    .filter((m) => isUrl(m));
                list.push(...notes);
            }
        } catch (error) {
            if (this.RECONNECT_NUM >= index) {
                return this.start();
            }
            this.log('Get Fail');
            throw error;
        }
        this.log('Get %s Banknotes', list.length);
        return this.store.add(list);
    }

}
