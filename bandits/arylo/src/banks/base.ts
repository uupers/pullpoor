import * as path from 'path';
import { URL } from 'url';
import stackTrace = require('stack-trace');
import isUrl = require('is-url');
import debug = require('debug');
import { sleep, date } from '../utils';
import { dbMemery } from '../db';

export class Bank {
    private source: string;
    private moneys: string[] = [ ];
    private updatedAt = 0;

    constructor(source: string) {
        this.source = source;
        try {
            const obj = dbMemery.get('banks').get(source).value();
            this.moneys = obj.moneys;
            this.updatedAt = obj.updatedAt;
        } catch (error) { }
    }

    public add(moneys: string[] = [ ]) {
        const moneySet = new Set<string>(this.moneys.concat(moneys));
        this.moneys = [...moneySet.values()];
        this.updatedAt = Date.now();
        dbMemery.get('banks').set(this.source, this).write();
        return this;
    }

    public get() {
        return {
            source: this.source,
            moneys: this.moneys,
            updatedAt: this.updatedAt,
            length: this.moneys.length
        };
    }
}

export abstract class BaseBank {

    protected readonly RECONNECT_NUM = 10;
    protected readonly DISTANCE_TIME = 200;
    protected readonly NAME = this.getName();

    private log = debug(`bandits:banks:${this.NAME}`);
    protected skip = false;
    protected addrs: string[] = [ ];
    protected bank = new Bank(this.NAME);
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

    protected getMoney(addr: string): PromiseLike<string[]> {
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

    private async runGetMoney(addr: string, index = 0): Promise<string[]> {
        try {
            return await this.getMoney(addr);
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.runGetMoney(addr, ++index);
            }
            return [ ];
        }
    }

    public readonly start = async (index = 0): Promise<Bank> => {
        if (this.skip) {
            this.log('Skip');
            return this.bank;
        }
        if ((Date.now() - this.bank.get().updatedAt) <= this.expiredAt) {
            this.log('Use Cache');
            return this.bank;
        }
        const list: string[] = [ ];
        try {
            const addrs =
                this.addrs.length !== 0 ? this.addrs : await this.runGetAddrs();
            for (const addr of addrs) {
                await sleep(this.DISTANCE_TIME);
                const moneys = (await this.runGetMoney(addr))
                    .filter((m) => isUrl(m));
                list.push(...moneys);
            }
        } catch (error) {
            if (this.RECONNECT_NUM >= index) {
                return this.start();
            }
            this.log('Get Fail');
            throw error;
        }
        this.log('Get %s Moneys', list.length);
        return this.bank.add(list);
    }

}
