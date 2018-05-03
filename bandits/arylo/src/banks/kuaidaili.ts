
import cheerio = require('cheerio');
import { BaseBank } from './base';
import { getHTML } from '../utils';

class Bank extends BaseBank {

    protected addrs = [
        'https://www.kuaidaili.com/free/inha/1/',
        'https://www.kuaidaili.com/free/intr/1/',
        'https://www.kuaidaili.com/free/inha/2/',
        'https://www.kuaidaili.com/free/intr/2/'
    ];

    protected async getMoney(addr: string, index = 0) {
        const list: string[] = [ ];
        try {
            return await getHTML(addr)
                .then(($) => $('.con-body #list tbody tr'))
                .then((trs) => {
                    for (const tr of trs.toArray()) {
                        const tds = cheerio('td', tr);
                        const txts =
                            [3, 0, 1].map((index) => tds.eq(index).text());
                        const url =
                            `${txts[0].toLowerCase()}://${txts[1]}:${txts[2]}`;
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
