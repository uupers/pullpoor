import { BaseBank } from './base';
import cheerio = require('cheerio');
import { getHTML, date } from '../utils';

class Bank extends BaseBank {

    protected addrs = [
        'http://www.xicidaili.com/',
        'http://www.xicidaili.com/nn/',
        'http://www.xicidaili.com/nt/',
        'http://www.xicidaili.com/wn/',
        'http://www.xicidaili.com/wt/'
    ].concat(...Array(5).fill(1).map((_, index) => {
        return [
            `http://www.xicidaili.com/nn/${index + 1}`,
            `http://www.xicidaili.com/nt/${index + 1}`,
            `http://www.xicidaili.com/wn/${index + 1}`,
            `http://www.xicidaili.com/wt/${index + 1}`
        ];
    }));

    protected expiredAt = date.h(1);

    protected getMoney(addr: string, index = 0) {
        const list: string[] = [ ];
        return getHTML(addr)
            .then(($) => $('tr:has(td.country)'))
            .then((trs) => {
                for (const tr of trs.toArray()) {
                    const tds = cheerio('td', tr);
                    if (!/http/i.test(tds.eq(5).text())) {
                        continue;
                    }
                    const texts =
                        [5, 1, 2].map((index) => tds.eq(index).text());
                    const url =
                        `${texts[0].toLowerCase()}://${texts[1]}:${texts[2]}`;
                    list.push(url);
                }
                return list;
            });
    }

}

export const bank = new Bank();
