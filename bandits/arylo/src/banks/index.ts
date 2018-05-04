import * as fs from 'fs';
import debug = require('debug');
import schedule = require('node-schedule');
import { BaseBank, Bank } from './base';
import * as db from '../db';

class Banks {

    private log = debug('bandits:banks');

    private readonly banks = fs.readdirSync(`${__dirname}`)
        .filter((filepath) => {
            return !/^(?:(?:index|base)\.[tj]s|.+\.map)$/.test(filepath);
        })
        .map((filepath) => require(`./${filepath}`).bank as BaseBank);

    public start() {
        for (const bank of this.banks) {
            bank.start().then(() => {
                db.save();
            });
        }
    }

    public detach() {
        schedule.scheduleJob('*/5 * * * *', () => {
            this.get();
        });
        this.get();
    }

    public getList() {
        return db.getList();
    }

    public async get() {
        const list = await Promise.all(this.banks.reduce((arr, bank) => {
            arr.push(bank.start())
            return arr;
        }, [ ] as Promise<Bank>[]))
            .then((bs) => {
                const set = new Set<string>();
                for (const b of bs) {
                    for (const money of b.get().moneys) {
                        set.add(money);
                    }
                }
                return [...set.values()];
            });
        db.save();
        return list;
    }
}

export const banks = new Banks();
