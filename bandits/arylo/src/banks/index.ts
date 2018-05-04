import * as fs from 'fs';
import debug = require('debug');
import schedule = require('node-schedule');
import { BaseBank, Store } from './base';
import * as db from '../db';

class Banks {

    private log = debug('bandits:banks');

    private readonly banks = fs.readdirSync(`${__dirname}`)
        .filter((filepath) => {
            return !/^(?:(?:index|base)\.[tj]s|.+\.map)$/.test(filepath);
        })
        .map((filepath) => require(`./${filepath}`).bank as BaseBank);

    public start() {
        return this.banks.reduce((arr, bank) => {
            arr.push(bank.start())
            return arr;
        }, [ ] as Promise<Store>[]);
    }

    public loop() {
        schedule.scheduleJob('*/5 * * * *', () => {
            this.get();
        });
        this.get();
    }

    public getList() {
        return db.getIds();
    }

    public async get() {
        const list = await Promise.all(this.start())
        return this.getList();
    }
}

export const banks = new Banks();
