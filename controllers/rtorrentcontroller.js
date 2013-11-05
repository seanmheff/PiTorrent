/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 03/08/13
 * Time: 18:42
 * To change this template use File | Settings | File Templates.
 */

module.exports = {
    getTorrents: getTorrents,
    getStandardData: getStandardData,
    getGlobalStats: getGlobalStats

};

var rtorrentapi = require("../code/rtorrent/rtorrentapi");
var rtorrentconstants = require("../code/rtorrent/rtorrentconstants.js");
var createrequest = require("../code/xml/createrequest.js");
var parseresponse = require("../code/xml/parseresponse.js");
var xmldoc = require('xmldoc');


/**
 * This function gets the hash of all the rtorrent torrents
 * (Each torrent has a unique hash)
 * @param callback The callback to execute when the data has returned from the rtorrent API
 */
function getTorrents(callback) {
    var request = createrequest.createRequest([rtorrentconstants.DOWNLOAD_DOWNLOAD_LIST]);

    rtorrentapi.execute(request, function(response) {
        if (response.toString().indexOf("error") == 0) {
            callback("There was a problem connecting to rtorrent");
        }

        // Remove the header
        response = parseresponse.removeResponseHeader(response);

        var data = new xmldoc.XmlDocument(response)
            .childNamed("params")
            .childNamed("param")
            .childNamed("value")
            .childNamed("array")
            .childNamed("data");

        var torrents = {torrents:[]};

        data.eachChild(function(value) {
            torrents.torrents.push( {
                "hash" : value.childNamed("string").val
            });
        });

        callback(JSON.stringify(torrents));
    });
}


/**
 * This function gets the standard data that we would expect to see in an overview of a torrent
 * (e.g. name, upload speed, download speed, ratio, etc.)
 * @param callback The callback to execute when the data has returned from the rtorrent API
 */
function getStandardData(callback) {
    var request = createrequest.createRequest(rtorrentconstants.MULTICALL_STANDARD_INFO);

    rtorrentapi.execute(request, function(response) {
        if (response.toString().indexOf("error") == 0) {
            callback("There was a problem connecting to rtorrent");
        }
        else {
            // Remove the header
            response = parseresponse.removeResponseHeader(response);

            // Traverse the XML document until we get to the data
            var data = new xmldoc.XmlDocument(response)
                .childNamed("params")
                .childNamed("param")
                .childNamed("value")
                .childNamed("array")
                .childNamed("data");

            var dataToReturn = {torrents:[]};

            // For each torrent
            data.eachChild(function(value) {
                var innerData = value.childNamed("array").childNamed("data");
                var torrentData = [];

                // For each parameter - push into temp array
                // Always push the child at index 0, this allows us to ignore types (<int>, <boolean>, etc)
                innerData.eachChild(function(innerValue) {
                    torrentData.push(innerValue.children[0].val);
                });

                var tmp = { };
                tmp["hash"] = torrentData[0];
                tmp["name"] = torrentData[1];
                tmp["size"] = torrentData[2];
                tmp["uploadRate"] = torrentData[3];
                tmp["downloadRate"] = torrentData[4];
                tmp["downloaded"] = torrentData[5];
                tmp["ratio"] = torrentData[6];
                tmp["complete"] = torrentData[7];
                dataToReturn.torrents.push(tmp);
            });

            callback(dataToReturn);
        }
    });
}


function getGlobalStats(callback) {
    var request = createrequest.createMulticallRequest(["system.multicall", "get_down_rate", "get_up_rate"]);

    rtorrentapi.execute(request, function(response) {
        if (response.toString().indexOf("error") == 0) {
            callback("There was a problem connecting to rtorrent");
        }
        else {
            // Remove the header
            response = parseresponse.removeResponseHeader(response);

            // Traverse the XML document until we get to the data
            var data = new xmldoc.XmlDocument(response)
                .childNamed("params")
                .childNamed("param")
                .childNamed("value")
                .childNamed("array")
                .childNamed("data");

            var dataToReturn = {};
            var fff = ["downSpeed", "upSpeed"];
            var counter = 0;

            // For each torrent
            data.eachChild(function(value) {
                var innerData = value.childNamed("array").childNamed("data");

                // For each parameter - push into temp array
                // Always push the child at index 0, this allows us to ignore types (<int>, <boolean>, etc)
                innerData.eachChild(function(innerValue) {
                    dataToReturn[fff[counter]] = innerValue.children[0].val;
                    counter += 1;
                });
            });

            callback(dataToReturn);
        }
    });
}