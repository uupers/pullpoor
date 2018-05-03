import * as fs from 'fs';
import { BaseBank } from './banks/base';

export const banks = new class {

    private readonly banks = fs.readdirSync(`${__dirname}/banks`)
        .filter((filepath) => {
            return !/^(?:(?:index|base)\.[tj]s|.+\.map)$/.test(filepath);
        })
        .map((filepath) => require(`./banks/${filepath}`).bank as BaseBank);

    public get() {
        return Promise.all(this.banks.reduce((arr, bank) => {
            arr.push(bank.start())
            return arr;
        }, [ ] as Promise<string[]>[]))
            .then((bs) => {
                const set = new Set<string>();
                for (const b of bs) {
                    for (const money of b) {
                        set.add(money);
                    }
                }
                return [...set.values()];
            });
    }
}
