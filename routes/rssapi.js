module.exports = {
    getRssFeeds: getRssFeeds
}

var rsscontroller = require('../controllers/rsscontroller.js');


/**
 *
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getRssFeeds(req, res) {
    res.json(rsscontroller.viewFeeds());
};