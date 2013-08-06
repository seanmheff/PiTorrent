/*
 * GET home page.
 */

var rtorrentcontroller = require('../controllers/rtorrentcontroller.js');

exports.index = function (req, res) {

    rtorrentcontroller.getStandardData(function(data) {
        res.render('index', {
            title: 'Express',
            torrents: data
        });
    });

};