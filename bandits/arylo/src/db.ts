import * as fs from 'fs';
import * as path from 'path';
import * as lowdb from 'lowdb';
import { argv } from './args';
import Memory = require('lowdb/adapters/Memory')
import FileSync = require('lowdb/adapters/FileSync')
import mkdirp = require('mkdirp')

export const DB_STORY_PATH = `${__dirname}/../stories`;
export const DB_TEMP_DB_PATH = `${DB_STORY_PATH}/db.json`;

const DEF_TEMP = { banks: { } };
const DEF_FILE_OPTIONS = { encoding: 'utf-8' };

const dbTemp = fs.existsSync(DB_TEMP_DB_PATH) ?
    lowdb(new FileSync(DB_TEMP_DB_PATH)) : null;

export const dbMemery = lowdb(new Memory(''));
dbMemery.defaults(argv.useCache && dbTemp ? dbTemp.value() : DEF_TEMP).write();

export const getList = () => {
    const list = dbMemery.get('banks').values().value().reduce((arr, bank) => {
        arr.push(...bank.moneys);
        return arr;
    }, [ ]);
    return [...new Set<string>(list)];
};

export const save = () => {
    if (!argv.deploy) {
        return true;
    }
    if (!fs.existsSync(DB_STORY_PATH)) {
        mkdirp.sync(DB_STORY_PATH);
    }

    const dbTemp = lowdb(new FileSync(DB_TEMP_DB_PATH));
    dbTemp.assign(dbMemery.value()).write();

    let list = dbMemery.get('banks').values().value().reduce((arr, bank) => {
        arr.push(...bank.moneys);
        return arr;
    }, [ ]);
    list = [...new Set(list)];
    // list
    let data = list.join('\n');
    fs.writeFileSync(`${DB_STORY_PATH}/story.list`, data, DEF_FILE_OPTIONS);
    // json
    data = JSON.stringify({
        list,
        length: list.length,
        status: 200,
        createdAt: Date.now()
    });
    fs.writeFileSync(`${DB_STORY_PATH}/story.json`, data, DEF_FILE_OPTIONS);
    return true;
};
