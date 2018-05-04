
import cheerio = require('cheerio');
import { BaseBank } from './base';
import { getHTML, date } from '../utils';

/**
 * 在墙外
 */
class Bank extends BaseBank {

    protected addrs = [
        'http://cn-proxy.com/',
        'http://cn-proxy.com/archives/218'
    ];

    protected expiredAt = date.h(12);

    protected getMoney(addr: string) {
        const list: string[] = [ ];
        return getHTML(addr)
            .then(($) => $('.sortable tbody tr'))
            .then((trs) => {
                for (const tr of trs.toArray()) {
                    const tds = cheerio('td', tr);
                    const texts =
                        [0, 1].map((index) => tds.eq(index).html());
                    const url =
                        `http://${texts[0]}:${texts[1]}`;
                    list.push(url);
                }
                return list;
            });
    }
}

export const bank = new Bank();
