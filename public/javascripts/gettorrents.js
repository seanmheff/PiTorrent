/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:16
 * To change this template use File | Settings | File Templates.
 */

var app = angular.module('myApp', ['ui.bootstrap']);


/**
 * An Angular filter function to determine if a torrent is seeding
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is seeding
 */
var seedingFilter = function (torrent) {
    return torrent.complete == 1
};


/**
 * An Angular filter function to determine if a torrent is leeching
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is leeching
 */
var leechingFilter = function (torrent) {
    return torrent.complete == 0
};


/**
 * An Angular filter function to determine if a torrent is currently currently uploading
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is currently uploading
 */
var uploadingFilter = function (torrent) {
    return torrent.uploadRate > 0
};


/**
 * An Angular filter function to determine if a torrent is currently currently downloading
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is currently downloading
 */
var downloadingFilter = function (torrent) {
    return torrent.downloadRate > 0
};


/**
 * This is the controller for the torrents
 */
app.controller('TorrentCtrl', function TorrentCtrl($scope, $http) {
    $scope.seeding = seedingFilter;
    $scope.leeching = leechingFilter;
    $scope.uploading = uploadingFilter;
    $scope.downloading = downloadingFilter;

    populateTorrents($scope, $http);

    setInterval(function() {
        updateTorrents($scope, $http);
    }, 2000);
});


/**
 * This function populates the torrent array. It is called on init and when a torrent is added or removed
 * It resets all variables in the array
 * @param $scope The controller scope
 * @param $http The http service that is needed to make ajax requests
 */
function populateTorrents($scope, $http) {
    $http.get(document.location.href + 'torrents').success(function(torrents) {

        // Check to see if the server can communicate with rtorrent
        if (torrents == "There was a problem connecting to rtorrent") {
            $scope.cantConnectToRtorrent = true;
            return;
        }
        else {
            $scope.cantConnectToRtorrent = false;
        }

        for (var x in torrents.torrents) {
            torrents.torrents[x].percentDone = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            torrents.torrents[x]['size'] = convert(torrents.torrents[x]['size']);
            torrents.torrents[x]['uploadRateHumanReadable'] = convert(torrents.torrents[x]['uploadRate']);
            torrents.torrents[x]['downloadRateHumanReadable'] = convert(torrents.torrents[x]['downloadRate']);
            torrents.torrents[x]['downloaded'] = convert(torrents.torrents[x]['downloaded']);
        }
        $scope.torrentResults = torrents;
    });
}


/**
 * This function updates the torrent array. It is called at a set interval
 * It only updates variables in the view that may change over time (download rate, etc).
 * If it detects that any torrent have been added or removed, it calls "populateTorrents"
 * @param $scope The controller scope
 * @param $http The http service that is needed to make ajax requests
 */
function updateTorrents($scope, $http) {
    $http.get(document.location.href + 'torrents').success(function(torrents) {

        // Check to see if the server can communicate with rtorrent
        if (torrents == "There was a problem connecting to rtorrent") {
            $scope.cantConnectToRtorrent = true;
            return;
        }
        else {
            $scope.cantConnectToRtorrent = false;
        }

        // Check to see if any torrents have been added or removed
        // Must wrap in a try catch block, as $scope.torrentResults.torrents may not exist if populateTorrents
        // did not run successfully
        try {
            if (torrents.torrents.length !== $scope.torrentResults.torrents.length) {
                populateTorrents($scope, $http);
                return;
            }
        } catch (e) {
            populateTorrents($scope, $http);
            return;
        }

        // Update our torrent data
        for (var x in torrents.torrents) {
            var percentDone = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            var uploadRateHumanReadable = convert(torrents.torrents[x]['uploadRate']);
            var downloadRateHumanReadable = convert(torrents.torrents[x]['downloadRate']);
            var downloaded = convert(torrents.torrents[x]['downloaded']);
            var complete = torrents.torrents[x]['complete'];

            // Only update view if the variable has changed
            if ($scope.torrentResults.torrents[x].percentDone !== percentDone ) {
                $scope.torrentResults.torrents[x].percentDone = percentDone;
            }

            if ($scope.torrentResults.torrents[x].uploadRateHumanReadable !== uploadRateHumanReadable ) {
                // Need to update non human readable upload rate for view filter checking
                $scope.torrentResults.torrents[x].uploadRate = torrents.torrents[x]['uploadRate'];
                $scope.torrentResults.torrents[x].uploadRateHumanReadable = uploadRateHumanReadable;
            }

            if ($scope.torrentResults.torrents[x].downloadRateHumanReadable !== downloadRateHumanReadable ) {
                // Need to update non human readable download rate for view filter checking
                $scope.torrentResults.torrents[x].downloadRate = torrents.torrents[x]['downloadRate'];
                $scope.torrentResults.torrents[x].downloadRateHumanReadable = downloadRateHumanReadable;
            }

            if ($scope.torrentResults.torrents[x].downloaded !== downloaded ) {
                $scope.torrentResults.torrents[x].downloaded = downloaded;
            }

            if ($scope.torrentResults.torrents[x].complete !== complete ) {
                $scope.torrentResults.torrents[x].complete = complete;
            }
        }
    });
}


/**
 * A helper function to convert bytes to a more human readable format
 * @param fileSizeInBytes A string that contains the size in bytes
 * @returns {string} Returns a human readable size
 */
function convert(fileSizeInBytes) {
    if (fileSizeInBytes == 0) {
        return "0.0 kB";
    }

    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}
