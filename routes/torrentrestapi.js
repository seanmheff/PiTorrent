module.exports = {
    getTorrents: getTorrents,
    getFileInfo: getFileInfo,
    getTrackerInfo: getTrackerInfo,
    getDetailedTorrentInfo: getDetailedTorrentInfo,
    getPeerInfo: getPeerInfo,
    getStats: getStats,
    stopTorrent: stopTorrent,
    startTorrent: startTorrent,
    removeTorrent: removeTorrent,
    setDownThrottle: setDownThrottle,
    setUpThrottle: setUpThrottle,
    upload: upload
};

var rtorrentcontroller = require('../controllers/rtorrentcontroller.js');
var nconf = require('nconf');
var flow = require('../config/flow-node.js')(nconf.get('torrentDir') + "/");
var formidable = require('formidable');


/**
 * A function to get basic torrent data
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getTorrents(req, res) {
    rtorrentcontroller.getStandardData(function(data) {
        sendResponse(data, res);
    });
}


/**
 * A function to get specific torrent file data for a specified torrent (specific hash)
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getFileInfo(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.getFileData(hash, function(data) {
        sendResponse(data, res);
    });
}


/**
 * A function to get specific torrent tracker data for a specified torrent (specific hash)
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getTrackerInfo(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.getTrackerData(hash, function(data) {
        sendResponse(data, res);
    });
}


/**
 * A function to get specific torrent data for a specified torrent (specific hash)
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getDetailedTorrentInfo(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.getDetailedTorrentInfo(hash, function(data) {
        sendResponse(data, res);
    });
}


/**
 * A function to get specific torrent peer data for a specified torrent (specific hash)
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getPeerInfo(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.getPeerInfo(hash, function(data) {
        sendResponse(data, res);
    });
}


/**
 * A function to get torrent global stats (overall upload/download speed, etc)
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getStats(req, res) {
    rtorrentcontroller.getGlobalStats(function(data) {
        sendResponse(data, res);
    });
}


/**
 * A private function to send a HTTP response to a client
 * @param data The data to send to the client
 * @param res A HTTP response
 */
function sendResponse(data, res) {
    if (data === "There was a problem connecting to rtorrent") {
        res.send(data);
    }
    else {
        res.json(data);
    }
}


/**
 * A function to stop a torrent
 * @param req The HTTP request
 * @param res The HTTP response
 */
function stopTorrent(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.stopTorrent(hash, function(status) {
        res.send(status);
    });
}


/**
 * A function to start a torrent
 * @param req The HTTP request
 * @param res The HTTP response
 */
function startTorrent(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.startTorrent(hash, function(status) {
        res.send(status);
    });
}


/**
 * A function to remove a torrent
 * @param req The HTTP request
 * @param res The HTTP response
 */
function removeTorrent(req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.removeTorrent(hash, function(status) {
        res.send(status);
    });
}


/**
 * A function to set a download throttle
 * @param req The HTTP request
 * @param res The HTTP response
 */
function setDownThrottle(req, res) {
    var speed = req.params.speed;
    rtorrentcontroller.setDownThrottle(speed, function(status) {
        res.send(status);
    });
}


/**
 * A function to set a upload throttle
 * @param req The HTTP request
 * @param res The HTTP response
 */
function setUpThrottle(req, res) {
    var speed = req.params.speed;
    rtorrentcontroller.setUpThrottle(speed, function(status) {
        res.send(status);
    });
}


/**
 * A function to upload a torrent file
 * @param req The HTTP request
 * @param res The HTTP response
 */
function upload(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        req.body = fields;
        req.files = files;

        flow.post(req, function(status, filename, original_filename, identifier) {
            if (status === "done") {

            }
            console.log('POST', status, original_filename, identifier);
            res.send(200, {
                // NOTE: Uncomment this funciton to enable cross-domain request.
                //'Access-Control-Allow-Origin': '*'
            });
        });
    });
}
