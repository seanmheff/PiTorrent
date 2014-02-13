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
var path = require('path');
var nconf = require('nconf');


/**
 * A function to get system information (hostname, load, etc)
 * @param callback The callback to execute when the data has been loaded
 */
function getSystemInfo(callback) {
    diskspace.check(nconf.get('rootFileSystem'), function (total, free, status) {
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
    // Check for .torrent extension
    if (path.extname(targetPath) !== ".torrent") {
        callback(null, "Not a torrent file");
        return;
    }

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


/**
 * A function to GET a torrent file from a URL
 * @param torrentURL The URL of the torrent to GET
 * @param callback The callback to execute when the function finishes
 */
function getTorrentFromURL(torrentURL, callback) {
    var torrentURL = url.parse(torrentURL);

    // Check for .torrent extension
    if (path.extname(torrentURL.path) !== ".torrent") {
        callback(500);
    }
    // Have to account for the fact the URL could be a HTTPS url
    else if (torrentURL.protocol === "https:") {
        https.get(torrentURL.href, function(res) {
            if (res.statusCode == 200) {
                var file = fs.createWriteStream(nconf.get('torrentDir') + path.basename(torrentURL.path));
                res.pipe(file);
            }
            callback(res.statusCode);
        });
    }
    else if (torrentURL.protocol === "http:") {
        http.get(torrentURL.href, function(res) {
            if (res.statusCode == 200) {
                var file = fs.createWriteStream(nconf.get('torrentDir') + path.basename(torrentURL.path));
                res.pipe(file);
            }
            callback(res.statusCode);
        });
    }
}