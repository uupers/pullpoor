import { URL } from 'url';
import cheerio = require('cheerio');
import { BaseBank } from './base';
import { getHTML, getJSON, date } from '../utils';

class Bank extends BaseBank {

    protected expiredAt = date.h(12);

    protected async getAddrs(index = 0) {
        const list: string[] = [ ];
        try {
            return await getHTML('http://www.xsdaili.com/')
                .then(($) =>
                    $(`a[href^='/dayProxy/ip/']`)
                )
                .then((as: any) => {
                    for (const a of as.toArray()) {
                        const url = new URL('http://www.xsdaili.com/');
                        url.pathname = cheerio(a).attr('href');
                        list.push(url.toString());
                    }
                    return [...new Set(list)];
                });
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.getAddrs(++index);
            }
            return list;
        }
    }

    protected async getMoney(addr: string, index = 0) {
        const list: string[] = [ ];
        try {
            return await getHTML(addr)
                .then(($) => $('.cont').html().replace(/\s+/g, ''))
                .then((html) => {
                    const reg = /((?:\d+\.){3}\d+:\d+)@(HTTPS?)/i;
                    return html
                        .match(new RegExp(reg, 'g'))
                        .map((str) => str.toString())
                        .map((str) => {
                            const matches = str.match(reg);
                            return `${matches[2].toLowerCase()}://${matches[1]}`;
                        });
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
