import { URL } from 'url';

import cheerio = require('cheerio');
import rp = require('request-promise');
import ua = require('random-useragent');
import { merge } from 'lodash';

export const sleep = (time: number) => {
    return new Promise((reslove) => {
        setTimeout(reslove, time);
    });
};

const getOptions = {
    method: 'GET',
    timeout: 60 * 1000,
    headers: {
        'Cache-Control': 'max-age=0',
        Connection: 'keep-alive'
    }
};

export const getHTML = (url: string, opts?) => {
    const options = merge({ }, getOptions, {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        },
        headers: {
            Host: new URL(url).host,
            Referer: url,
            'User-Agent': ua.getRandom()
        }
    }, opts);
    return rp(options);
};

export const getJSON = (url: string, opts?) => {
    const options = merge({ }, getOptions, {
        uri: url,
        transform: function (body) {
            return typeof body === 'string' ? JSON.parse(body) : body;
        },
        headers: {
            Host: new URL(url).host,
            Referer: url,
            'User-Agent': ua.getRandom()
        }
    }, opts);
    return rp(options);
};

export const date = new class {

    public s(t: number) {
        return t * 1000;
    }

    public m(t: number) {
        return t * this.s(60);
    }

    public h(t: number) {
        return t * this.m(60);
    }

    public d(t: number) {
        return t * this.h(24);
    }

};
