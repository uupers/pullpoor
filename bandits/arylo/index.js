const { argv } = require('./dist/args');
const utils = require('./dist/utils');

argv.deploy = argv.useCache;

(async () => {
    if (argv.detach) {
        while (true) {
            require('./dist').banks.get();
            await utils.sleep(utils.date.m(1));
        }
    } else {
        require('./dist').banks.get();
    }
})();
