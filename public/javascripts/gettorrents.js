/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:16
 * To change this template use File | Settings | File Templates.
 */

var app = angular.module('myApp', ['ui.bootstrap']);


app.controller('TorrentCtrl', function TorrentCtrl($scope, $http) {
    populateTorrents($scope, $http);

    setInterval(function(){
        getTorrents($scope, $http);
    },2000);
});

function populateTorrents($scope, $http) {
    $http.get('http://localhost:3000/torrents').success(function(torrents) {

        for (var x in torrents.torrents) {
            torrents.torrents[x].percentDone = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            torrents.torrents[x]['size'] = convert(torrents.torrents[x]['size']);
            torrents.torrents[x]['uploadRate'] = convert(torrents.torrents[x]['uploadRate']);
            torrents.torrents[x]['downloadRate'] = convert(torrents.torrents[x]['downloadRate']);
            torrents.torrents[x]['downloaded'] = convert(torrents.torrents[x]['downloaded']);
        }
        $scope.torrentResults = torrents;
    });
}

function getTorrents($scope, $http) {
    $http.get('http://localhost:3000/torrents').success(function(torrents) {

        // Check to see if any torrents have been added or removed
        if (torrents.torrents.length !== $scope.torrentResults.torrents.length) {
            populateTorrents($scope, $http);
            return;
        }

        for (var x in torrents.torrents) {

            var percentDone = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            var uploadRate = convert(torrents.torrents[x]['uploadRate']);
            var downloadRate = convert(torrents.torrents[x]['downloadRate']);
            var downloaded = convert(torrents.torrents[x]['downloaded']);
            var complete = torrents.torrents[x]['complete'];

            if ($scope.torrentResults.torrents[x].percentDone !== percentDone ) {
                $scope.torrentResults.torrents[x].percentDone = percentDone;
            }

            if ($scope.torrentResults.torrents[x].uploadRate !== uploadRate ) {
                $scope.torrentResults.torrents[x].uploadRate = uploadRate;
            }

            if ($scope.torrentResults.torrents[x].downloadRate !== downloadRate ) {
                $scope.torrentResults.torrents[x].downloadRate = downloadRate;
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
