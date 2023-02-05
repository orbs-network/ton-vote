"use strict";
exports.__esModule = true;
var _1 = require(".");
var Logger = require("./logger");
process.on('uncaughtException', function (err) {
    Logger.log('Uncaught exception on process, shutting down:');
    Logger.error(err.stack);
    process.exit(1);
});
try {
    Logger.log('Ton Vote BE started');
    var server_1 = (0, _1.serve)();
    process.on('SIGINT', function () {
        Logger.log('Received SIGINT, shutting down.');
        if (server_1) {
            server_1.close(function (err) {
                if (err) {
                    Logger.error(err.stack || err.toString());
                }
                process.exit();
            });
        }
    });
}
catch (err) {
    Logger.log('Exception thrown from main, shutting down:');
    Logger.error(err.stack);
    process.exit(128);
}
