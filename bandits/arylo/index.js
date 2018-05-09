const ora = require('ora');
const moment = require('moment');
const { argv } = require("./dist/args");
const { sleep, date } = require("./dist/utils");

argv.deploy = argv.useCache;

(async () => {
    require('cfonts').say('UUPERS', { align: 'left', font: 'block' });
    moment.locale('zh-cn');
    const banks = require('.').banks;
    const banksEvent = require('.').BanksEvent;
    banks.on(banksEvent.GETTING, () => {
        const startDate = Date.now();
        const bar = ora("正在获取").start();
        banks.once(banksEvent.GETTED, () => {
            bar
                .succeed(`获取完毕, 用时${moment(startDate).fromNow(true)}`)
                .stop();
        });
    });
    if (argv.detach) {
        banks.loop();
        while (true) {
            await sleep(date.m(1));
        }
    } else {
        banks.get();
    }
})();
