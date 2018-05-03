import { URL } from 'url';
import { BaseBank } from './base';
import cheerio = require('cheerio');
import rp = require('request-promise');

/**
 * 已经停止供应了
 * -- 2018-05-02
 */
class Bank extends BaseBank {

    protected skip = true;

    protected addrs = ['', ''].map((_, index) => {
        const url =
            new URL('http://www.xdaili.cn/ipagent/freeip/getFreeIps');
        url.searchParams.set('page', `${index}`);
        return url.toString();
    });

    protected async getMoney(addr: string, index = 0) {
        try {
            return await rp({
                method: 'GET',
                uri: addr,
                timeout: 60 * 1000,
                transform: function (body) {
                    return typeof body === 'string' ? JSON.parse(body) : body;
                }
            })
                .then((res) => {
                    return res.RESULT.rows || [ ];
                }).then((arr) => {
                    return arr.map((item) => {
                        return `http://${item.ip}:${item.port}`;
                    });
                });
        } catch (error) {
            if (index < this.RECONNECT_NUM) {
                return this.getMoney(addr, ++index);
            }
            return [ ];
        }
    }

}

export const bank = new Bank();
