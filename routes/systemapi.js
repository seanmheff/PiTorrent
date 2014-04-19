module.exports = {
    getSystemStats:getSystemStats,
    addTorrent: addTorrent,
    addTorrentURL: addTorrentURL,
    getSettings: getSettings,
    setSettings: setSettings,
    fileBrowser: fileBrowser
}

var systemcontroller = require('../controllers/systemcontroller.js');
var nconf = require('nconf');


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
    res.json(nconf.file("config").load());
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
 * A function to browse through the files on our device
 * @param req The HTTP request
 * @param res The HTTP response
 */
function fileBrowser(req, res) {
    // Extract the file path from the URL
    var path = req.params[0];
    systemcontroller.fileBrowser(path, function(err, data) {
        if (err) {
            res.send(405, err);
        }
        else {
            res.json(data);
        }
    });
}