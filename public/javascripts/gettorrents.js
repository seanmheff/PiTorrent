/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:16
 * To change this template use File | Settings | File Templates.
 */

var app = angular.module('myApp', ['ui.bootstrap']);

seeding = function (torrent) {
    if (torrent.complete == 1) {
        return true;
    }
    return false;
};

leeching = function (torrent) {
    if (torrent.complete == 0) {
        return true;
    }
    return false;
};

uploadingFilter = function (torrent) {
    if (torrent.uploadRate > 0) {
        return true;
    }
    return false;
};


downloadingFilter = function (torrent) {
    if (torrent.downloadRate > 0) {
        return true;
    }
    return false;
};


app.controller('TorrentCtrl', function TorrentCtrl($scope, $http) {
    var view = "main";

    $scope.tabs = [
        { title:"All", orderBy:"name", filter:"" },
        { title:"Seeding", orderBy:"name", filter:seeding },
        { title:"Leeching", orderBy:"name", filter:leeching },
        { title:"Currently seeding", orderBy:"uploadRate", filter:"uploadingFilter" },
        { title:"Currently leeching", orderBy:"uploadRate", filter:downloadingFilter }
    ];

    populateTorrents($scope, $http, view);

    setInterval(function(){
        getTorrents($scope, $http, view);
    },2000);
});


function populateTorrents($scope, $http) {
    $http.get(document.location.href + 'torrents').success(function(torrents) {
        for (var x in torrents.torrents) {
            torrents.torrents[x].percentDone = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            torrents.torrents[x]['size'] = convert(torrents.torrents[x]['size']);
            torrents.torrents[x]['uploadRateAdjusted'] = convert(torrents.torrents[x]['uploadRate']);
            torrents.torrents[x]['downloadRateAdjusted'] = convert(torrents.torrents[x]['downloadRate']);
            torrents.torrents[x]['downloaded'] = convert(torrents.torrents[x]['downloaded']);
        }
        $scope.torrentResults = torrents;
    });
}


function getTorrents($scope, $http) {
    $http.get(document.location.href + 'torrents').success(function(torrents) {
        // Check to see if any torrents have been added or removed
        if (torrents.torrents.length !== $scope.torrentResults.torrents.length) {
            populateTorrents($scope, $http);
            return;
        }

        for (var x in torrents.torrents) {
            var percentDone = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            var uploadRateAdjusted = convert(torrents.torrents[x]['uploadRate']);
            var downloadRateAdjusted = convert(torrents.torrents[x]['downloadRate']);
            var downloaded = convert(torrents.torrents[x]['downloaded']);
            var complete = torrents.torrents[x]['complete'];

            if ($scope.torrentResults.torrents[x].percentDone !== percentDone ) {
                $scope.torrentResults.torrents[x].percentDone = percentDone;
            }

            if ($scope.torrentResults.torrents[x].uploadRateAdjusted !== uploadRateAdjusted ) {
                $scope.torrentResults.torrents[x].uploadRate = torrents.torrents[x]['uploadRate'];
                $scope.torrentResults.torrents[x].uploadRateAdjusted = uploadRateAdjusted;
            }

            if ($scope.torrentResults.torrents[x].downloadRateAdjusted !== downloadRateAdjusted ) {
                $scope.torrentResults.torrents[x].downloadRate = torrents.torrents[x]['downloadRate'];
                $scope.torrentResults.torrents[x].downloadRateAdjusted = downloadRateAdjusted;
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
