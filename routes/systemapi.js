module.exports = {
    getSystemStats:getSystemStats,
    addTorrent: addTorrent,
    addTorrentURL: addTorrentURL
}

var systemcontroller = require('../controllers/systemcontroller.js');


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
    var tmpPath = req.files.torrentData.path;
    var targetPath = '/home/sean/Desktop/Torrents/' + req.files.torrentData.name;

    systemcontroller.uploadTorrent(tmpPath, targetPath, function(msg, err){
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
}


function addTorrentURL(req, res) {
    var url = req.body.url;

    systemcontroller.getTorrentFromURL(url, function(statusCode){
        if (statusCode !== 200) {
            console.log("Could not GET torrent: " + statusCode);
        }
        res.redirect("/");
    });
}