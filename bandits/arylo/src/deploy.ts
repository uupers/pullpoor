import fs = require('fs');
import rimraf = require('rimraf');
import lodash = require('lodash');
import gitModule = require('simple-git');
import { DB_STORY_PATH } from './db';
import { argv } from './args';
import { date } from './utils';

export const process = lodash.debounce(async () => {
    const token = argv.publish;
    if (!token || token.length === 0) {
        return false;
    }
    await rimraf.sync(`${DB_STORY_PATH}/.git`);
    fs.createReadStream(`${DB_STORY_PATH}/../README.md`)
        .pipe(fs.createWriteStream(`${DB_STORY_PATH}/README.md`));
    gitModule(DB_STORY_PATH)
        .init()
        .add(`${DB_STORY_PATH}/*`)
        .commit('Update Stories')
        .addRemote('origin', `https://${token}@github.com/uupers/pullpoor.git`)
        .push('origin', 'master:static', ['-f']);
    return true;
}, date.s(30));
