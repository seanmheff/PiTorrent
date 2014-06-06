module.exports = {
    viewFeeds: viewFeeds,
    updateFeeds: updateFeeds
};


var xmldoc = require('xmldoc');
var request = require('request');
var nconf = require('nconf');
var systemcontroller = require('./systemcontroller');
var newestTorrents = {};


/**
 * A function to get the RSS feeds from the config file
 * @returns {Array} Returns an array of objects containing the RSS feeds
 */
function viewFeeds() {
    return nconf.get("feeds");
}


/**
 * A function to update our RSS feeds
 * @param feeds The RSS feeds as an array of objects
 * @returns {*} Returns the saved RSS feeds as an array of objects
 */
function updateFeeds(feeds) {
    nconf.set("feeds", feeds);
    nconf.save();
    return nconf.get("feeds");
}


/**
 * A function to GET RSS feeds. Uses the 'request' module to avoid any http/https issues
 * @param feeds An array of objects. Each object it an RSS feed
 */
function getFeeds(feeds) {
    for (var i=0; i<feeds.length; i++) {
        var queries = feeds[i].queries;
        var url = feeds[i].url;

        console.log("Getting RSS feed: " + url);

        // GET the feed
        request(url, function (error, response, body) {
        	if (!error && response.statusCode == 200) {
             	parseRssFeed(body, url, queries);
           	}
            else {
                // Error handling code
                console.log("Error getting RSS feed " + url);
                if (error) {
                    console.log(error);
                }
                if (response) {
                    console.log("HTTP status code: " + response.statusCode);
                }

                // Push a notification to the clients
                var ws = require('../config/websocket');
                ws.sendGetRssFeedFailedMessage(url, error);
            }
        });
    }
}


/**
 * A function to parse torrent RSS feeds.
 * Assuming the feeds all use the format outlined here: http://www.bittorrent.org/beps/bep_0036.html
 * @param xml The RSS feed XML
 * @param url The URL of the RSS feed, Needed for performing lookups on the "newestTorrents" object
 * @param queries An array of regular expressions that can match the torrents in the RSS feeds
 */
function parseRssFeed(xml, url, queries) {
    var data = new xmldoc.XmlDocument(xml).childNamed("channel");
    var torrents = data.childrenNamed("item");

    // For each torrent in the RSS feed
    for (var i=0; i<torrents.length; i++) {
        // Get the title
        var title = torrents[i].childNamed("title").val;

        // When we start to see "old" torrents (ones we have seen already) - stop parsing
        if (title === newestTorrents[url].newestTorrent) {
            break;
        }

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

                        // Push a notification to the clients
                        var ws = require('../config/websocket');
                        ws.sendGetTorrentFailedMessage(link, statusCode);
                    }
                    else {
                        // Push a notification to the clients
                        var ws = require('../config/websocket');
                        ws.sendRssTorrentAddedMessage(title);  
                    }
                });
            }
        }
    }
    // Reset "newestTorrents" variable
    newestTorrents[url].newestTorrent = torrents[0].childNamed("title").val;
}


/**
 * A daemon function that controls downloading our RSS feeds
 */
(function rssDaemon() {
    // Do not run the daemon in non production environments
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    console.log("Running RSS daemon");

    // Initially grab our feeds
    var feeds = nconf.get("feeds");
    for (var i=0; i<feeds.length; i++) {
        newestTorrents[feeds[i].url] = {"newestTorrent": null};
    }
    getFeeds(feeds);

    // Time function allows us to use a changeable interval
    var myFunction = function() {
        clearInterval(interval);

        // Grab our feeds - need to check for new feeds in our config and add "newestTorrent" variable for it
        feeds = nconf.get("feeds");
        for (var i=0; i<feeds.length; i++) {
            if (!(feeds[i].url in newestTorrents)) {
                newestTorrents[feeds[i].url] = {"newestTorrent": null};
            }
        }
        getFeeds(feeds);

        // Setup the next interval
        intervalTime = nconf.get("rssInterval") * 60000;
        interval = setInterval(myFunction, intervalTime);
    }

    // Multiply to get milliseconds
    var intervalTime = nconf.get("rssInterval") * 60000;
    var interval = setInterval(myFunction, intervalTime);
}());
