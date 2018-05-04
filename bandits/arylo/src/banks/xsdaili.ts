import { URL } from 'url';
import cheerio = require('cheerio');
import { BaseBank } from './base';
import { getHTML, getJSON, date } from '../utils';

class Bank extends BaseBank {

    protected expiredAt = date.h(12);

    protected getAddrs(index = 0) {
        const list: string[] = [ ];
        return getHTML('http://www.xsdaili.com/')
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
    }

    protected getBanknotes(addr: string) {
        const list: string[] = [ ];
        return getHTML(addr)
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
    }
}

export const bank = new Bank();
