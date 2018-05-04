import { URL } from 'url';
import { BaseBank } from './base';
import { getJSON } from '../utils';

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

    protected getBanknotes(addr: string) {
        return getJSON(addr)
            .then((res) => {
                return res.RESULT.rows || [ ];
            }).then((arr) => {
                return arr.map((item) => {
                    return `http://${item.ip}:${item.port}`;
                });
            });
    }

}

export const bank = new Bank();
