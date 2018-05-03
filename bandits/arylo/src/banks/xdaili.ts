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

    protected async getMoney(addr: string, index = 0) {
        try {
            return await getJSON(addr)
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
