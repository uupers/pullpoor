
import cheerio = require('cheerio');
import { BaseBank } from './base';
import { getHTML, getJSON } from '../utils';
import * as date from 'dtss';

class Bank extends BaseBank {

    protected expiredAt = date.h(12);

    protected getAddrs(index = 0) {
        const list: string[] = [ ];
        return getHTML('http://www.mayidaili.com/share/')
            .then(($) =>
                $(`a[href^='http://www.mayidaili.com/share/view/']`)
            )
            .then((as: any) => {
                for (const a of as.toArray()) {
                    list.push(cheerio(a).attr('href'));
                }
                return [...new Set(list)];
            });
    }

    protected getBanknotes(addr: string) {
        const list: string[] = [ ];
        return getHTML(addr)
            .then(($) => $('.container p'))
            .then((p) => {
                return p.text()
                    .match(/(\d+\.){3}\d+:\d+/gi)
                    .map((item) => item.toString())
                    .map((item) => `http://${item}`);
            });
    }
}

export const bank = new Bank();
