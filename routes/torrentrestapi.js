module.exports = {
    getTorrents: getTorrents,
    getFileInfo: getFileInfo,
    getTrackerInfo: getTrackerInfo,
    getDetailedTorrentInfo: getDetailedTorrentInfo,
    getPeerInfo: getPeerInfo,
    getStats: getStats
};

var rtorrentcontroller = require('../controllers/rtorrentcontroller.js');


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