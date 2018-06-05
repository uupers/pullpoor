import { URL } from 'url';
import { BaseBank } from './base';
import { getHTML } from '../utils';
import * as date from 'dtss';

class Bank extends BaseBank {

    protected addrs =  [
        'on'/** 全国 **/, '%B5%E7%D0%C5'/** 电信 **/,
        '%C1%AA%CD%A8'/** 联通 **/, '%D2%C6%B6%AF'/** 移动 **/
    ].map((item) => {
            const url = new URL('http://www.89ip.cn/tiqv.php');
            url.searchParams.set('sxb', '');
            url.searchParams.set('tqsl', '1000');
            url.searchParams.set('ports', '');
            url.searchParams.set('ktip', '');
            url.searchParams.set('submit', '%CC%E1++%C8%A1');
            url.searchParams.set('xl', item);
            return url.toString();
        });

    protected expiredAt = date.m(30);

    protected getBanknotes(addr: string) {
        return getHTML(addr)
            .then(($) => $('.mass').html().replace(/\s+/g, ''))
            .then((html) => {
                return html
                    .match(/(\d+\.){3}\d+:\d+(?!:<br>)/gi)
                    .map((item) => item.toString())
                    .map((item) => `http://${item}`);
            });
    }
}

export const bank = new Bank();
