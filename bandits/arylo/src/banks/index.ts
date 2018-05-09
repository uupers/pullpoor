import * as fs from 'fs';
import debug = require('debug');
import schedule = require('node-schedule');
import { BaseBank, Store, BankEvent } from './base';
import * as db from '../db';
import { EventEmitter } from 'events';

export const BanksEvent = {
    'GETTING': Symbol('GETTING'),
    'GETTED': Symbol('GETTED')
};

export const banks = new class Banks extends EventEmitter {

    private log = debug('bandits:banks');

    private readonly banks = fs.readdirSync(`${__dirname}`)
        .filter((filepath) => {
            return !/^(?:(?:index|base)\.[tj]s|.+\.map)$/.test(filepath);
        })
        .map((filepath) => require(`./${filepath}`).bank as BaseBank);

    constructor() {
        super();
        this.banks.forEach((bank) => {
            bank.on(BankEvent.SUCCESS, () => {
                db.save();
            });
        });
    }

    public start() {
        return this.banks.reduce((arr, bank) => {
            arr.push(bank.start())
            return arr;
        }, [ ] as Promise<Store>[]);
    }

    public loop() {
        const job = schedule.scheduleJob('*/5 * * * *', () => {
            this.get();
        });
        this.get();
        return () => schedule.cancelJob(job);
    }

    public getList() {
        return db.getIds();
    }

    public async get() {
        this.emit(BanksEvent.GETTING);
        await Promise.all(this.start())
            .then(() => {
                this.emit(BanksEvent.GETTED);
            });
        return this.getList();
    }
}
