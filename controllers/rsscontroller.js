module.exports = {
    viewFeeds: viewFeeds
};


var xmldoc = require('xmldoc');
var request = require('request');
var nconf = require('nconf');
var systemcontroller = require('./systemcontroller');


/**
 * A function to get the RSS feeds from the config file
 * @returns {Array} Returns an array containing the RSS feeds (URL strings)
 */
function viewFeeds() {
    return nconf.get("feeds");
}


/**
 * A function to GET RSS feeds. Uses the 'request' module to avoid any http/https issues
 * @param feeds An array of RSS feed URL's
 * @param queries An array of regular expressions that can match the torrents in the RSS feeds
 */
function getFeeds(feeds, queries) {
    for (var i=0; i<feeds.length; i++) {
        // GET the feed
        request(feeds[i], function (error, response, body) {
        	if (!error && response.statusCode == 200) {
             	parseRssFeed(body, queries);
           	}
            else {
                // Error handling code
                console.log("Error getting RSS feed " + feeds[i]);
                if (error) {
                    console.log(error);
                }
                console.log("HTTP status code: " + response.statusCode);
            }
        });
    }
}


/**
 * A function to parse torrent RSS feeds.
 * Assuming the feeds all use the format outlined here: http://www.bittorrent.org/beps/bep_0036.html
 * @param xml The RSS feed XML
 * @param queries An array of regular expressions that can match the torrents in the RSS feeds
 */
function parseRssFeed(xml, queries) {
    var data = new xmldoc.XmlDocument(xml).childNamed("channel");
    var torrents = data.childrenNamed("item");

    // For each torrent in the RSS feed
    for (var i=0; i<torrents.length; i++) {
        // Get the title
        var title = torrents[i].childNamed("title").val;

        // Check to see if the torrent matches a query string
        for (var j=0; j<queries.length; j++) {
            if (title.match(queries[j])) {
                console.log("RSS Match: " + title);

                // Download the show!
                var link = torrents[i].childNamed("link").val;
                console.log("Grabbing: " + link);
                systemcontroller.getTorrentFromURL(link, function(statusCode) {
                    if (statusCode !== 200) {
                        console.log("Could not GET torrent: " + statusCode);
                    }
                });
            }
        }
    }
}


// Auto start this function
(function rssDaemon() {

    return;
    console.log("Running RSS daemon");

    // Initially grab our feeds
    var feeds = nconf.get("feeds");
    var queries = nconf.get("queries");
    getFeeds(feeds, queries);

    // Multiply to get milliseconds
    var intervalTime = nconf.get("rssInterval") * 60000;
    var interval = setInterval(myFunction, intervalTime);

    // Time function allows us to use a changeable interval
    var myFunction = function() {
        clearInterval(interval);

        // Grab our feeds!
        feeds = nconf.get("feeds");
        queries = nconf.get("queries");
        getFeeds(feeds, queries);

        // Setup the next interval
        intervalTime = nconf.get("rssInterval") * 60000;
        interval = setInterval(myFunction, intervalTime);
    }
}());
