import * as fs from 'fs';
import * as path from 'path';
import * as lowdb from 'lowdb';
import Memory = require('lowdb/adapters/Memory')
import FileSync = require('lowdb/adapters/FileSync')
import mkdirp = require('mkdirp')
import * as lodash from 'lodash';
import { argv } from './args';
import { Money } from './banks/base';

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

export const getList = () => {
    const list: string[] = [ ]
    const sources: string[] = dbMemery.get('banks').keys().value();
    for (const source of sources) {
        const moneyList: Money[] =
            dbMemery.get('banks').get(source).get('moneys').value();
        list.push(...lodash.map(moneyList, (item) => item.id));
    }
    return [...new Set<string>(list)].sort();
};

export const save = () => {
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

    const list = getList();
    // list
    let data = list.join('\n');
    fs.writeFileSync(`${DB_STORY_PATH}/story.list`, data, DEF_FILE_OPTIONS);
    // json
    data = JSON.stringify({
        list,
        length: list.length,
        status: 200,
        createdAt: Date.now(),
        version: DEF_DATA_FORMAT.version
    });
    fs.writeFileSync(`${DB_STORY_PATH}/story.json`, data, DEF_FILE_OPTIONS);
    return true;
};
