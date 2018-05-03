import { URL } from 'url';
import { BaseBank } from './base';
import cheerio = require('cheerio');
import rp = require('request-promise');

class Bank extends BaseBank {

    protected addrs =  [
        'http://www.mogumiao.com/proxy/free/listFreeIp',
        'http://www.mogumiao.com/proxy/api/freeIp?count=20'
    ];

    protected async getMoney(addr: string, index = 0) {
        const list: string[] = [ ];
        try {
            return await rp({
                method: 'GET',
                uri: addr,
                timeout: 60 * 1000,
                transform: function (body) {
                    return typeof body === 'string' ? JSON.parse(body) : body;
                }
            })
                .then((data) => {
                    return (data.msg || [ ]).map((item) => {
                        return `http://${item.ip}:${item.port}`;
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
