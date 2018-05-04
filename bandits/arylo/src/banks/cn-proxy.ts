
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

    protected expiredAt = date.d(12);

    protected async getMoney(addr: string, index = 0) {
        const list: string[] = [ ];
        try {
            return await getHTML(addr)
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
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.getMoney(addr, ++index);
            }
            return list;
        }
    }
}

export const bank = new Bank();
