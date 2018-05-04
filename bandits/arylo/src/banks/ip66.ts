import { BaseBank } from './base';
import { getHTML, date } from '../utils';

class Bank extends BaseBank {

    protected addrs =  [
        'http://www.66ip.cn/mo.php?sxb=&tqsl=10000&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea='
    ];

    protected expiredAt = date.m(30);

    protected getMoney(addr: string) {
        return getHTML(addr)
            .then(($) => $('body').html().replace(/\s+/g, ''))
            .then((html) => {
                return html
                    .match(/(\d+\.){3}\d+:\d+(?!:<br>)/gi)
                    .map((item) => item.toString())
                    .map((item) => `http://${item}`);
            });
    }
}

export const bank = new Bank();
