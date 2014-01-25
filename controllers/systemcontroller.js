module.exports = {
    getSystemInfo: getSystemInfo
};

var os = require("os");
var diskspace = require('diskspace');


/**
 * A function to get system information (hostname, load, etc)
 * @param callback The callback to execute when the data has been loaded
 */
function getSystemInfo(callback) {
    diskspace.check('/', function (total, free, status) {
        var data = { };

        data["hostname"] = os.hostname();
        data["uptime"] = (new Date().getTime() - (os.uptime()*1000));
        data["loadavg"] = os.loadavg();
        data["networkInterfaces"] = os.networkInterfaces();
        data["totalDisk"] = total;
        data["freeDisk"] = free

        callback(data);
    });
}