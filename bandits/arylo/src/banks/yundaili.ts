
import cheerio = require('cheerio');
import { BaseBank } from './base';
import { getHTML } from '../utils';
import * as date from 'dtss';

class Bank extends BaseBank {

    protected addrs = [
        'http://www.ip3366.net/',
        'http://www.ip3366.net/free/'
    ];

    protected expiredAt = date.m(30);

    protected getBanknotes(addr: string) {
        const list: string[] = [ ];
        return getHTML(addr)
            .then(($) => $('tbody tr'))
            .then((trs) => {
                for (const tr of trs.toArray()) {
                    const tds = cheerio('td', tr);
                    const texts =
                        [3, 0, 1].map((index) => tds.eq(index).text());
                    const url =
                        `${texts[0].toLowerCase()}://${texts[1]}:${texts[2]}`;
                    list.push(url);
                }
                return list;
            });
    }

}

export const bank = new Bank();
