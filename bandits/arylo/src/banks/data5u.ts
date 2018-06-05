import { BaseBank } from './base';
import cheerio = require('cheerio');
import { getHTML } from '../utils';
import * as date from 'dtss';

class Bank extends BaseBank {

    protected addrs = [
        'http://www.data5u.com/free/index.shtml',
        'http://www.data5u.com/free/gngn/index.shtml',
        'http://www.data5u.com/free/gnpt/index.shtml',
        'http://www.data5u.com/free/gwgn/index.shtml',
        'http://www.data5u.com/free/gwpt/index.shtml'
    ];

    protected expiredAt = date.m(3);

    protected getBanknotes(addr: string) {
        const list: string[] = [ ];
        return getHTML(addr)
            .then(($) => $('.wlist ul.l2'))
            .then((uls) => {
                for (const ul of uls.toArray()) {
                    const lis = cheerio('li', ul);
                    const texts =
                        [3, 0, 1].map((index) => lis.eq(index).text());
                    const url =
                        `${texts[0]}://${texts[1]}:${texts[2]}`;
                    list.push(url);
                }
                return list;
            });
    }

}

export const bank = new Bank();
