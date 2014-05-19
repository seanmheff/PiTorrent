module.exports = {
    getRssFeeds: getRssFeeds,
    updateRssFeeds: updateRssFeeds
}

var rsscontroller = require('../controllers/rsscontroller.js');


/**
 * A function to get our RSS feeds
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getRssFeeds(req, res) {
    res.json(rsscontroller.viewFeeds());
};


/**
 * A function to update our RSS feeds
 * @param req The HTTP request
 * @param res The HTTP response
 */
function updateRssFeeds(req, res) {
    res.json(rsscontroller.updateFeeds(req.body));
}