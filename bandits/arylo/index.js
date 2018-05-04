const { argv } = require('./dist/args');
const utils = require('./dist/utils');

(async () => {
    if (argv.detach) {
        require('./dist').banks.detach();
        while (true) {
            await utils.sleep(utils.date.m(1));
        }
    } else {
        require('./dist').banks.get();
    }
})();
