/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:00
 * To change this template use File | Settings | File Templates.
 */

var rtorrentcontroller = require('../controllers/rtorrentcontroller.js');


/**
 * A function to get torrent data
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
exports.getTorrents = function (req, res) {
    rtorrentcontroller.getStandardData(function(data) {
        // Send the response as JSON or text, depending on the data
        if (data === "There was a problem connecting to rtorrent") {
            res.send(data);
        }
        else {
            res.json(data);
        }
    });
};


exports.getTorrentInfo = function (req, res) {
    var hash = req.params.hash;
    rtorrentcontroller.getFileData(hash, function(data) {
        // Send the response as JSON or text, depending on the data
        if (data === "There was a problem connecting to rtorrent") {
            res.send(data);
        }
        else {
            res.json(data);
        }
    });
};


/**
 * A function to get torrent global stats (overall upload/download speed, etc)
 * Sends either an error message or a JSON object to the client
 * @param req The HTTP request
 * @param res The HTTP response
 */
exports.getStats = function (req, res) {
    rtorrentcontroller.getGlobalStats(function(data) {
        // Send the response as JSON or text, depending on the data
        if (data === "There was a problem connecting to rtorrent") {
            res.send(data);
        }
        else {
            res.json(data);
        }
    });
};