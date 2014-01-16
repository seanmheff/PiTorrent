module.exports = {
    getTorrents: getTorrents,
    getStandardData: getStandardData,
    getFileData: getFileData,
    getTrackerData: getTrackerData,
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


function getTrackerData(hash, callback) {
    var request = createrequest.createTrackerMulticallRequest(hash, rtorrentconstants.MULTICALL_TRACKER_INFO);

    rtorrentapi.execute(request, function(response) {
        if (response.toString().indexOf("error") == 0) {
            callback("There was a problem connecting to rtorrent");
        }
        else {
            // Remove the header
            response = parseresponse.removeResponseHeader(response);
            var dataToReturn = { "trackers": [] };

            // Check for errors (invalid hash used as an input)
            try {
                // Traverse the XML document until we get to the data
                var data = new xmldoc.XmlDocument(response)
                    .childNamed("params")
                    .childNamed("param")
                    .childNamed("value")
                    .childNamed("array")
                    .childNamed("data");

                // For each file
                data.eachChild(function(value) {
                    var innerData = value.childNamed("array").childNamed("data");
                    var trackerData = [];

                    // For each parameter - push into temp array
                    // Always push the child at index 0, this allows us to ignore types (<int>, <boolean>, etc)
                    innerData.eachChild(function(innerValue) {
                        trackerData.push(innerValue.children[0].val);
                    });

                    var tmp = { };
                    tmp["url"] = trackerData[0];
                    tmp["minInterval"] = trackerData[1];
                    tmp["normalInterval"] = trackerData[2];
                    tmp["isEnabled"] = trackerData[3];

                    // Push the data into the "files" array in the correct directory in the JSON object we will return
                    dataToReturn.trackers.push(tmp);
                });
            }
            catch (err) {
                console.log(err.toString());
                console.log(dataToReturn);
                callback({trackers:[]});
                return;
            }

            callback(dataToReturn);
        }
    });
}


function getFileData(hash, callback) {
    var request = createrequest.createFileMulticallRequest(hash, rtorrentconstants.MULTICALL_FILE_INFO);

    rtorrentapi.execute(request, function(response) {
        if (response.toString().indexOf("error") == 0) {
            callback("There was a problem connecting to rtorrent");
        }
        else {
            // Remove the header
            response = parseresponse.removeResponseHeader(response);
            var dataToReturn = { "files": [] };

            // Check for errors (invalid hash used as an input)
            try {
                // Traverse the XML document until we get to the data
                var data = new xmldoc.XmlDocument(response)
                    .childNamed("params")
                    .childNamed("param")
                    .childNamed("value")
                    .childNamed("array")
                    .childNamed("data");


                // For each file
                data.eachChild(function(value) {
                    var innerData = value.childNamed("array").childNamed("data");
                    var torrentData = [];

                    // For each parameter - push into temp array
                    // Always push the child at index 0, this allows us to ignore types (<int>, <boolean>, etc)
                    innerData.eachChild(function(innerValue) {
                        torrentData.push(innerValue.children[0].val);
                    });


                    // The next few lines create the directory structure needed
                    // to efficiently transmit the file data as JSON

                    // The file path is split up into the various directories
                    var directories = torrentData[0].split("/");

                    // We need to keep track of the current directory we are in
                    var currentDirectory = dataToReturn;

                    // Check to see if the directories exist in the JSON object to return
                    // If not - create them
                    for (var i=0; i< directories.length-1; i++) {
                        if (currentDirectory[directories[i]] === undefined) {
                            currentDirectory[directories[i]] = { "files": [] };
                            currentDirectory = currentDirectory[directories[i]];
                        }
                        else {
                            currentDirectory = currentDirectory[directories[i]];
                        }
                    }

                    var tmp = { };
                    tmp["name"] = directories[directories.length-1];
                    tmp["sizeBytes"] = torrentData[1];
                    tmp["sizeChunks"] = torrentData[2];
                    tmp["chunksComplete"] = torrentData[3];
                    tmp["priority"] = torrentData[4];

                    // Push the data into the "files" array in the correct directory in the JSON object we will return
                    currentDirectory.files.push(tmp);
                });
            }
            catch (err) {
                console.log(err.toString());
                console.log(dataToReturn);
                callback({files:[]});
                return;
            }

            callback(dataToReturn);
        }
    });
}


/**
 * This function gets the global stats we would expect to see for a torrent client
 * (e.g. global download speed, global upload speed, throttle limits, etc)
 * @param callback The callback to execute when the data has returned from the rtorrent API
 */
function getGlobalStats(callback) {
    var request = createrequest.createMulticallRequest(rtorrentconstants.MULTICALL_GLOBAL_STATS);

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
            var stats = ["downSpeed", "upSpeed", "downLimit", "upLimit"];
            var counter = 0;

            // For each separate multicall function
            data.eachChild(function(value) {
                var value2 = value.childNamed("array").childNamed("data").childNamed("value");

                // Add the returned value to the "dataToReturn" array
                // Use the "eachChild" function as this allows us to ignore types (<int>, <boolean>, etc)
                // e.g. node could be <i8>data</i8> or <boolean>data</boolean>
                // There should only ever be one child... So doing this is safe enough... I hope!
                value2.eachChild(function(innerValue) {
                    dataToReturn[stats[counter++]] = innerValue.val;
                });
            });

            callback(dataToReturn);
        }
    });
}