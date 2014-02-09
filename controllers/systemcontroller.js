module.exports = {
    getSystemInfo: getSystemInfo,
    uploadTorrent: uploadTorrent,
    getTorrentFromURL: getTorrentFromURL
};

var os = require("os");
var diskspace = require('diskspace');
var fs = require('fs');
var url = require('url');
var https = require('https');
var http = require('http');
var path = require('path')



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


/**
 * A function to handle the upload of a torrent file
 * @param tmpPath The path of the uploaded torrent file
 * @param targetPath The path we wish to move the torrent file to
 * @param callback The callback to execute when the file has been moved
 */
function uploadTorrent(tmpPath, targetPath, callback) {
    // move the file from the temporary location to the intended location
    fs.rename(tmpPath, targetPath, function(err) {
        if (err) {
            callback(null, err)
        }
        // delete the temporary file
        fs.unlink(tmpPath, function(err) {
            if (err) {
                callback(null, err)
            }
            callback("ok")
        });
    });
}


function getTorrentFromURL(torrentURL, callback) {
    var torrentURL = url.parse(torrentURL);

    if (torrentURL.protocol === "https:") {
        https.get(torrentURL.href, function(res) {
            if (res.statusCode == 200) {
                var file = fs.createWriteStream('/home/sean/Desktop/Torrents/' + path.basename(torrentURL.path));
                res.pipe(file);
            }
            callback(res.statusCode);
        });
    }
    else if (torrentURL.protocol === "http:") {
        http.get(torrentURL.href, function(res) {
            if (res.statusCode == 200) {
                var file = fs.createWriteStream('/home/sean/Desktop/Torrents/' + path.basename(torrentURL.path));
                res.pipe(file);
            }
            callback(res.statusCode);
        });
    }
}