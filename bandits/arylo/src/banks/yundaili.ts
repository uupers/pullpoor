import { BaseBank } from './base';
import cheerio = require('cheerio');
import rp = require('request-promise');

class Bank extends BaseBank {

    protected addrs = [
        'http://www.ip3366.net/free/'
    ];

    protected async getMoney(addr: string, index = 0) {
        const list: string[] = [ ];
        try {
            return await rp({
                method: 'GET',
                uri: addr,
                timeout: 60 * 1000,
                transform: function (body) {
                    return cheerio.load(body);
                }
            })
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
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.getMoney(addr, ++index);
            }
            return list;
        }
    }

}

export const bank = new Bank();
