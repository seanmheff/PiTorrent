module.exports = {
    getSystemInfo: getSystemInfo,
    uploadTorrent: uploadTorrent,
    getTorrentFromURL: getTorrentFromURL,
    fileBrowser: fileBrowser
};

var os = require("os");
var diskspace = require('diskspace');
var fs = require('fs');
var url = require('url');
var https = require('https');
var http = require('http');
var path = require('path');
var nconf = require('nconf').file('config/config.json');
var map = {
    'compressed': ['zip', 'rar', 'gz', '7z'],
    'text': ['txt', 'md', ''],
    'image': ['jpg', 'jpge', 'png', 'gif', 'bmp'],
    'pdf': ['pdf'],
    'css': ['css'],
    'html': ['html'],
    'word': ['doc', 'docx'],
    'powerpoint': ['ppt', 'pptx'],
    'movie': ['mkv', 'avi', 'rmvb', 'mp4']
};
var cached = {};


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
                try {
                    var file = fs.createWriteStream(nconf.get('torrentDir') + path.basename(torrentURL.path));
                    res.pipe(file);
                } catch (err) {
                    callback(500);
                    return;
                }
            }
            callback(res.statusCode);
        });
    }
    else if (torrentURL.protocol === "http:") {
        http.get(torrentURL.href, function(res) {
            if (res.statusCode == 200) {
                try {
                    var file = fs.createWriteStream(nconf.get('torrentDir') + path.basename(torrentURL.path));
                    res.pipe(file);
                } catch (err) {
                    callback(500);
                    return;
                }
            }
            callback(res.statusCode);
        });
    }
}


/**
 * A function to build a JSON representation of a directory
 * @param filePath The path of the directory to browse
 * @param callback The callback to execute when the function finishes
 */
function fileBrowser(filePath, callback) {
    // Get the name of the directory to browse (download directory + user specified path)
    var dir = path.join(nconf.get("downloadDir"), filePath);

    // Read the directory
    fs.readdir(dir, function (err, files) {
        if (err) {
            callback("Invalid directory");
        }
        else {
            // Create the object that will act as our response
            var data = {
                "files": [],
                "dirs": [],
                "breadcrumb": ["/"]
            };

            // When not requesting the root directory - build the breadcrumb
            if (filePath.length > 0) {
                data.breadcrumb = data.breadcrumb.concat(filePath.split("/"))
            }

            // For each item in the directory
            for (var i=0; i<files.length; i++) {
                // Determine if item is a file or directory
                if (fs.statSync(path.join(nconf.get("downloadDir"), filePath, files[i])).isFile()) {
                    // Get the file extension
                    var ext = path.extname(files[i]).substr(1);
                    var file = {};
                    file.name = files[i];
                    file.type = cached[ext];

                    // Check to see if the extension has been cached
                    if (!file.type) {
                        for (var key in map) {
                            if (map[key].indexOf(ext) != -1) {
                                cached[ext] = file.type = key;
                                break;
                            }
                        }
                        // If extension cannot be determined
                        if (!file.type)
                            file.type = 'blank';
                    }
                    data.files.push(file)
                }
                else {
                    data.dirs.push(files[i])
                }
            }
            callback(null, data);
        }
    });
}