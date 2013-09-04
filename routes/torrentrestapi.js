/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:00
 * To change this template use File | Settings | File Templates.
 */

var rtorrentcontroller = require('../controllers/rtorrentcontroller.js');

exports.get = function (req, res) {
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