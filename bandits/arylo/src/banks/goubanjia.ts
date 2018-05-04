import { BaseBank } from './base';
import cheerio = require('cheerio');
import { getHTML, date } from '../utils';

class Bank extends BaseBank {

    protected addrs = [
        'http://www.goubanjia.com/'
    ];

    protected expiredAt = date.m(3);

    protected async getMoney(addr: string, index = 0) {
        const reg = /<\w+\s+style="display:\s*none;">.+?>/g;
        const list: string[] = [ ];
        try {
            const trs = await getHTML(addr)
                .then(($) => $('table tbody tr'));
            for (let i = 0; i < trs.length - 1; i++) {
                const tr = trs.eq(i);
                const tds = cheerio('td', tr);

                const texts = [2, 0]
                    .map((index) => tds.eq(index).html() as string)
                    .map((item, index) => {
                        if (index === 1) {
                            item = item.replace(reg, '');
                        }
                        const $ = cheerio.load(item) as any;
                        return $.text();
                    });
                list.push(`${texts[0]}://${texts[1]}`);
            }
            return list;
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.getMoney(addr, ++index);
            }
            return list;
        }
    }

}

export const bank = new Bank();
