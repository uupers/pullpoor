import { BaseBank } from './base';
import cheerio = require('cheerio');
import { getHTML, date } from '../utils';

class Bank extends BaseBank {

    protected addrs = [
        'https://ip.seofangfa.com/'
    ];

    protected expiredAt = date.m(15);

    protected getBanknotes(addr: string) {
        const list: string[] = [ ];
        return getHTML(addr)
            .then(($) => $('tr'))
            .then((trs) => {
                for (const tr of trs.toArray()) {
                    const tds = cheerio('td', tr);
                    const texts =
                        [0, 1].map((index) => tds.eq(index).text());
                    const url =
                        `http://${texts[0]}:${texts[1]}`;
                    list.push(url);
                }
                return list;
            });
    }

}

export const bank = new Bank();
