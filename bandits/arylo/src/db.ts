import * as fs from 'fs';
import * as path from 'path';
import * as lowdb from 'lowdb';
import Memory = require('lowdb/adapters/Memory')
import FileSync = require('lowdb/adapters/FileSync')
import mkdirp = require('mkdirp')
import * as lodash from 'lodash';
import { argv } from './args';
import { Banknote } from './banks/base';
import * as publish from './deploy';
import * as date from 'dtss';

export const DB_STORY_PATH = `${__dirname}/../stories`;
export const DB_TEMP_DB_PATH = `${DB_STORY_PATH}/db.json`;

const DEF_DATA_FORMAT = { banks: { }, version: 1 };
const DEF_FILE_OPTIONS = { encoding: 'utf-8' };

const dbTemp = fs.existsSync(DB_TEMP_DB_PATH) ?
    lowdb(new FileSync(DB_TEMP_DB_PATH)) : null;

export const dbMemery = lowdb(new Memory(''));
dbMemery
    .defaults(argv.useCache && dbTemp ? dbTemp.getState() : DEF_DATA_FORMAT)
    .write();

export const getIds = () => {
    const list: string[] = [ ]
    const sources: string[] = dbMemery.get('banks').keys().value();
    for (const source of sources) {
        const noteList: Banknote[] =
            dbMemery.get('banks').get(source).get('list').value();
        list.push(...lodash.map(noteList, (item) => item.id));
    }
    return [...new Set<string>(list)].sort();
};

const jsonContentFactroy = (list: string[]) => {
    return JSON.stringify({
        list,
        length: list.length,
        status: 200,
        createdAt: Date.now(),
        version: DEF_DATA_FORMAT.version
    });
}

export const save = lodash.debounce(() => {
    if ((argv.deploy || argv.useCache) && !fs.existsSync(DB_STORY_PATH)) {
        mkdirp.sync(DB_STORY_PATH);
    }
    if (argv.useCache) {
        const dbTemp = lowdb(new FileSync(DB_TEMP_DB_PATH));
        dbTemp.setState(dbMemery.getState()).write();
    }

    if (!argv.deploy) {
        return true;
    }

    const list = getIds();
    const httpList = list.filter((item) => !!~item.indexOf('http://'));
    const httpsList = list.filter((item) => !!~item.indexOf('https://'));
    const configs = [{
        filename: 'story.list',
        content: list.join('\n')
    }, {
        filename: 'story.json',
        content: jsonContentFactroy(list)
    }];
    for (const config of configs) {
        const filepath = `${DB_STORY_PATH}/${config.filename}`;
        fs.writeFileSync(filepath, config.content, DEF_FILE_OPTIONS);
    }
    if (argv.publish && argv.publish.length !== 0) {
        publish.process();
    }
    return true;
}, date.s(3));
