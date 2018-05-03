import { URL } from 'url';
import { BaseBank } from './base';
import cheerio = require('cheerio');
import rp = require('request-promise');

class Bank extends BaseBank {

    protected async getAddrs(index = 0) {
        const list: string[] = [ ];
        try {
            return await rp({
                method: 'GET',
                uri: 'http://www.mayidaili.com/share/',
                timeout: 60 * 1000,
                transform: function (body) {
                    return cheerio.load(body);
                }
            })
                .then(($) =>
                    $('a[href^=\'http://www.mayidaili.com/share/view/\']')
                )
                .then((as: any) => {
                    for (const a of as.toArray()) {
                        list.push(cheerio(a).attr('href'));
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
            return await rp({
                method: 'GET',
                uri: addr,
                timeout: 60 * 1000,
                transform: function (body) {
                    return cheerio.load(body);
                }
            })
                .then(($) => $('.container p'))
                .then((p) => {
                    return p.text()
                        .match(/(\d+\.){3}\d+:\d+/gi)
                        .map((item) => item.toString())
                        .map((item) => `http://${item}`);
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
