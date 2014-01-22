module.exports = {
    getSystemInfo: getSystemInfo
};

var os = require("os");
var diskspace = require('diskspace');


function getSystemInfo(callback) {
    var data = { };

    diskspace.check('/', function (total, free, status) {
        data["hostname"] = os.hostname();
        data["uptime"] = (new Date().getTime() - (os.uptime()*1000));
        data["loadavg"] = os.loadavg();
        data["networkInterfaces"] = os.networkInterfaces();
        data["hostname"] = os.hostname();
        data["totalDisk"] = total;
        data["freeDisk"] = free

        callback(data);
    });
}