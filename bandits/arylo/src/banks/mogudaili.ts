import { BaseBank } from './base';
import { getJSON, date } from '../utils';

class Bank extends BaseBank {

    protected addrs =  [
        'http://www.mogumiao.com/proxy/free/listFreeIp',
        'http://www.mogumiao.com/proxy/api/freeIp?count=20'
    ];

    protected expiredAt = date.m(30);

    protected getBanknotes(addr: string) {
        const list: string[] = [ ];
        return getJSON(addr)
            .then((data) => {
                return (data.msg || [ ]).map((item) => {
                    return `http://${item.ip}:${item.port}`;
                });
            });
    }
}

export const bank = new Bank();
