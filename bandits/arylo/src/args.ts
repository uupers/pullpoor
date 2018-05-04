import minimist = require('minimist');

export const argv = minimist(process.argv.slice(2), {
    string: ["publish"],
    boolean: ["deploy", "useCache", "detach"],
    default: {
        "deploy": true,
        "useCache": true
    }
});
