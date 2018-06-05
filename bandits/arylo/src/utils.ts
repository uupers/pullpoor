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
