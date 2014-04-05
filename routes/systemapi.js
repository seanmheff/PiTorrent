module.exports = {
    getSystemStats:getSystemStats,
    addTorrent: addTorrent,
    addTorrentURL: addTorrentURL,
    getSettings: getSettings,
    setSettings: setSettings,
    fileBrowser: fileBrowser
}

var systemcontroller = require('../controllers/systemcontroller.js');
var fs = require('fs');
var path = require("path");
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
    'movie': ['mkv', 'avi', 'rmvb'],
};
var cached = {};



/**
 * A function to get system stats
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getSystemStats(req, res) {
    systemcontroller.getSystemInfo(function(data) {
        res.json(data);
    });
};


/**
 * A function to upload a .torrent file to the server
 * @param req The HTTP request
 * @param res The HTTP response
 */
function addTorrent(req, res) {
    var tmpPath = req.files.file.path;
    var targetPath = nconf.get("torrentDir") + req.files.file.name;

    systemcontroller.uploadTorrent(tmpPath, targetPath, function(msg, err){
        if (err) {
            res.send(err);
        }
        res.send(req.files.file.name + " uploaded to server");
    });
}


/**
 * A function to GET a torrent file from a URL
 * @param req The HTTP request
 * @param res The HTTP response
 */
function addTorrentURL(req, res) {
    var url = req.body.url;

    systemcontroller.getTorrentFromURL(url, function(statusCode){
        if (statusCode !== 200) {
            console.log("Could not GET torrent: " + statusCode);
        }
        res.redirect("/");
    });
}


/**
 * A function to get the app's settings and return them as JSON
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getSettings(req, res) {
    res.json(nconf.file('config/config.json').load());
}


/**
 * A function to set the app's settings
 * @param req The HTTP request
 * @param res The HTTP response
 */
function setSettings(req, res) {
    for (var key in req.body) {
        nconf.set(key, req.body[key]);
    }
    nconf.save();
    res.redirect("/#/settings");
}


/**
 *
 * @param req
 * @param res
 */
function fileBrowser(req, res) {
    var dir = path.join(nconf.get("downloadDir"), req.params[0]) ;

    fs.readdir(dir, function (err, files) {
        if (err) {
            res.send(405, "Invalid directory");
        }
        else {
            var data = {
                "files": [],
                "dirs": [],
                "breadcrumb": ["/"]
            };

            console.log(req.params[0].length)
            if (req.params[0].length > 0) {
                data.breadcrumb = data.breadcrumb.concat(req.params[0].split("/"))
            }

            for (var i=0; i<files.length; i++) {
                if (fs.statSync(path.join(nconf.get("downloadDir"), req.params[0], files[i])).isFile()) {
                    var ext = path.extname(files[i]).substr(1);
                    var file = {};
                    file.name = files[i];
                    file.type = cached[ext];

                    if (!file.type) {
                        for (var key in map) {
                            if (map[key].indexOf(ext) != -1) {
                                cached[ext] = file.type = key;
                                break;
                            }
                        }
                        if (!file.type)
                            file.type = 'blank';
                    }
                    data.files.push(file)
                }
                else {
                    data.dirs.push(files[i])
                }
            }
            res.json(data);
        }
    });
}