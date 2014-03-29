/**
 * This module contains our angular controllers
 * We define the module and inject its dependencies
 */
var app = angular.module('myApp.controllers', ['flow', 'ngAnimate', 'ajoslin.promise-tracker', 'cgBusy', 'tableSort']);

app.value('cgBusyTemplateName','../../style/loading-template.html');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
 * This is the controller for the torrents
 */
app.controller('TorrentCtrl', function TorrentCtrl($scope, $http, sharedTorrentName, $location, $modal, $timeout) {
    $scope.changingThrottleSpeeds = false;

    $scope.stopped = app.stoppedFilter;
    $scope.started = app.startedFilter;
    $scope.seeding = app.seedingFilter;
    $scope.leeching = app.leechingFilter;
    $scope.uploading = app.uploadingFilter;
    $scope.downloading = app.downloadingFilter;
    $scope.jstree = {children:[]};

    // This is needed for selecting tabs from the overview widget
    $scope.tab = {
        overviewTab:false,
        allTab:false,
        stoppedTab:false,
        startedTab:false,
        seedingTab:false,
        leechingTab:false,
        currUpTab:false,
        currDownTab:false
    };

    // Function to highlight the 'Torrents' sidebar item, if the url contains 'main'
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'main';
        if (currentRoute.substring(0,4) === "main") {
            currentRoute = "main";
        }
        return page === currentRoute ? 'current open' : '';
    };

    $scope.setName = function(name) {
        sharedTorrentName.setName(name);
    };

    $scope.stopTorrent = function(hash) {
        $http.get(document.location.origin + '/stop/' + hash);
    };

    $scope.startTorrent = function(hash) {
        $http.get(document.location.origin + '/start/' + hash);
    };

    $scope.openModal = function(hash, name) {
        var modalDeferred = $modal.open({
            templateUrl: 'partials/delete-modal',
            controller: function($scope) {
                $scope.name = name;
            }
        });

        // If the user clicks 'ok', remove the torrent
        modalDeferred.result.then(function () {
            $http.get(document.location.origin + '/remove/' + hash);
        });
    };

    // Set up our chart data
    $scope.downloadData = [[]];
    $scope.uploadData = [[]];

    for (var i=0; i<counter; i++) {
        $scope.downloadData[0].push([i,0]);
        $scope.uploadData[0].push([i,0]);
    }

    populateTorrents($scope, $http);
    getGlobalStats($scope, $http);
    getSystemStats($scope, $http);

    setInterval(function() {
        updateTorrents($scope, $http);
        getGlobalStats($scope, $http);
    }, 2000);

    setInterval(function() {
        getSystemStats($scope, $http);
    }, 5000);


    $scope.clickDownloadThrottle = function() {
        if ($scope.changingThrottleSpeeds) {
            // Convert speed to bytes
            var bytes = ($scope.downLimitKb * 1024) + ($scope.downLimitMb*1024*1024);
            $http.get(document.location.origin + '/set-down-throttle/' + bytes);
        }
        $scope.changingThrottleSpeeds = !$scope.changingThrottleSpeeds;
    };

    $scope.uploadComplete = function($flow) {
        $timeout(function() {
            $flow.cancel();
        }, 5000);
    }
});


/**
 * A controller for the 'detailed info' route
 */
app.controller('DetailedOverviewCtrl', function DetailedOverviewCtrl($scope, $http, $routeParams, $interval, sharedTorrentName) {
    var hash = $routeParams.torrentHash;
    $scope.hash = $routeParams.torrentHash;
    $scope.name = sharedTorrentName.getName();

    $http.get(document.location.origin + '/info/' + hash, {tracker: 'overview'}).success(function(detailedInfo) {
        detailedInfo.eta = secondsToTime(detailedInfo.size/detailedInfo.down);
        detailedInfo.percentDone = (detailedInfo.downloaded / detailedInfo.size * 100).toFixed(1);
        detailedInfo.size = convertBytes(detailedInfo.size);
        detailedInfo.ratio = detailedInfo.uploaded/detailedInfo.downloaded || 0;
        detailedInfo.downloaded = convertBytes(detailedInfo.downloaded);
        detailedInfo.uploaded = convertBytes(detailedInfo.uploaded);
        detailedInfo.up = convertBytes(detailedInfo.up);
        detailedInfo.down = convertBytes(detailedInfo.down);
        $scope.torrentInfo = detailedInfo;
    });

    var interval = $interval(function() {
        $http.get(document.location.origin + '/info/' + hash, {tracker: 'overview'}).success(function(detailedInfo) {
            detailedInfo.eta = secondsToTime(detailedInfo.size/detailedInfo.down);
            detailedInfo.percentDone = (detailedInfo.downloaded / detailedInfo.size * 100).toFixed(1);
            detailedInfo.size = convertBytes(detailedInfo.size);
            detailedInfo.ratio = detailedInfo.uploaded/detailedInfo.downloaded || 0;
            detailedInfo.downloaded = convertBytes(detailedInfo.downloaded);
            detailedInfo.uploaded = convertBytes(detailedInfo.uploaded);
            detailedInfo.up = convertBytes(detailedInfo.up);
            detailedInfo.down = convertBytes(detailedInfo.down);
            $scope.torrentInfo = detailedInfo;
        });
    }, 2000);

    $scope.$on('$destroy', function() {
        $interval.cancel(interval);
    });
});


/**
 * A controller for the 'detailed peer info' route
 */
app.controller('DetailedPeerCtrl', function DetailedPeerCtrl($scope, $http, $routeParams, $interval, sharedTorrentName) {
    var hash = $routeParams.torrentHash;
    $scope.hash = $routeParams.torrentHash;
    $scope.name = sharedTorrentName.getName();

    $http.get(document.location.origin + '/peers/' + hash, {tracker: 'peers'}).success(function(detailedInfo) {
        for (var i in detailedInfo.peers) {
            detailedInfo.peers[i].downRateHuman = convertBytes(detailedInfo.peers[i].downRate);
            detailedInfo.peers[i].upRateHuman = convertBytes(detailedInfo.peers[i].upRate);
        }
        $scope.peerInfo = detailedInfo;
    });

    var interval = $interval(function() {
        $http.get(document.location.origin + '/peers/' + hash).success(function(detailedInfo) {
            for (var i in detailedInfo.peers) {
                detailedInfo.peers[i].downRateHuman = convertBytes(detailedInfo.peers[i].downRate);
                detailedInfo.peers[i].upRateHuman = convertBytes(detailedInfo.peers[i].upRate);
            }
            $scope.peerInfo = detailedInfo;
        });
    }, 2000);

    $scope.$on('$destroy', function() {
        $interval.cancel(interval);
    });
});


/**
 * A controller for the 'detailed file info' route
 */
app.controller('DetailedFileCtrl', function DetailedFileCtrl($scope, $http, $routeParams, sharedTorrentName) {
    var hash = $routeParams.torrentHash;
    $http.get(document.location.origin + '/files/' + hash, {tracker: 'files'}).success(function(detailedInfo) {
        recursiveFileWalk(detailedInfo);
        $scope.fileData = detailedInfo;
    });

    $scope.hash = $routeParams.torrentHash;
    $scope.name = sharedTorrentName.getName();
});


/**
 * A controller for the 'settings' part of the app
 */
app.controller('SettingsCtrl', function SettingsCtrl($scope, $http) {
    $http.get(document.location.origin + '/settings').success(function(settings) {
        $scope.settings = settings;
    });
});


/**
 * A controller for the upload torrent functionality
 */
app.controller('UploadTorrent', function UploadTorrent($scope, $upload) {
    var ddd;
    $scope.fileSelected = false;

    $scope.selectFile = function($files) {
        ddd = $files[0];
        $scope.fileSelected = true;
    };

    $scope.uploadFile = function() {
        $scope.upload = $upload.upload({
            url: 'add-torrent',
            file: ddd
        }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
                $scope.fileSelected = false;
            });
    }

});


var counter = 150; // Counter needed for flot chart


/**
 * A recursive function used to augment the data returned from the 'files' API
 * The function finds leaf nodes in the object and computes additional data for these nodes
 * @param obj The object to perform the walk on
 */
function recursiveFileWalk(obj) {
    if (obj.children.length === 0) {
        obj.sizeHuman = convertBytes(obj.sizeBytes);
        obj.priorityHuman = convertPriority(obj.priority);
        obj.percentComplete = (obj.chunksComplete/obj.sizeChunks) * 100;
    }
    else {
        for (var i=0; i<obj.children.length; i++) {
            recursiveFileWalk(obj.children[i]);
        }
    }
}


/**
 * A helper function to convert a number to a priority
 * The 'files' API returns a download priority for each file, which is a number in the set [0,1,2].
 * This function converts that number to a specific string in the set ['off', 'normal', 'high']
 * @param priority {string} The numeric priority
 * @returns {string} The priority, as a human readable string
 */
function convertPriority(priority) {
    if (priority == 0) {
        return "off";
    }
    else if (priority == 1) {
        return "normal";
    }
    else {
        return "high";
    }
}


/**
 * This function populates the torrent array. It is called on init and when a torrent is added or removed
 * It resets all variables in the array
 * @param $scope The controller scope
 * @param $http The http service that is needed to make ajax requests
 */
function populateTorrents($scope, $http) {
    $http.get(document.location.origin + '/torrents').success(function(torrents) {

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
            torrents.torrents[x]['size'] = convertBytes(torrents.torrents[x]['size']);
            torrents.torrents[x]['uploadRateHumanReadable'] = convertBytes(torrents.torrents[x]['uploadRate']);
            torrents.torrents[x]['downloadRateHumanReadable'] = convertBytes(torrents.torrents[x]['downloadRate']);
            torrents.torrents[x]['downloaded'] = convertBytes(torrents.torrents[x]['downloaded']);
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
    $http.get(document.location.origin + '/torrents').success(function(torrents) {

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
            var uploadRateHumanReadable = convertBytes(torrents.torrents[x]['uploadRate']);
            var downloadRateHumanReadable = convertBytes(torrents.torrents[x]['downloadRate']);
            var downloaded = convertBytes(torrents.torrents[x]['downloaded']);
            var complete = torrents.torrents[x]['complete'];
            var trackerMsg = torrents.torrents[x]['trackerMsg'];
            var active = torrents.torrents[x]['active'];

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

            if ($scope.torrentResults.torrents[x].active !== active ) {
                $scope.torrentResults.torrents[x].active = active;
            }

            if ($scope.torrentResults.torrents[x].trackerMsg !== trackerMsg ) {
                $scope.torrentResults.torrents[x].trackerMsg = trackerMsg;
            }
        }
    });
}


/**
 * This function gets system stats via an AJAX request
 * @param $scope The controller scope
 * @param $http The http service that is needed to make ajax requests
 */
function getSystemStats($scope, $http) {
    $http.get(document.location.origin + '/system-stats').success(function(systemInfo) {
        systemInfo.totalSpaceNormalized = convertBytes(systemInfo.totalDisk);
        systemInfo.freeSpaceNormalized = convertBytes(systemInfo.freeDisk);
        $scope.systemInfo = systemInfo;
    });
}


/**
 * A helper function to convert bytes to a more human readable format
 * @param fileSizeInBytes A string that contains the size in bytes
 * @returns {string} Returns a human readable size
 */
function convertBytes(fileSizeInBytes) {
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


/**
 * A function that gets and updates the global rTorrent stats.
 * This function is called at a set interval.
 * @param $scope The controller scope
 * @param $http The http service that is needed to make ajax requests
 */
function getGlobalStats($scope, $http) {
    $http.get(document.location.origin + '/stats').success(function(stats) {

        // Check to see if the server can communicate with rtorrent
        if (stats == "There was a problem connecting to rtorrent") {
            $scope.cantConnectToRtorrent = true;
            return;
        }
        else {
            $scope.cantConnectToRtorrent = false;
        }

        pushDownloadSpeed($scope, stats.downSpeed);
        pushUploadSpeed($scope, stats.upSpeed);

        // Convert bytes to human readable format
        stats.downSpeed = convertBytes(stats.downSpeed);
        stats.upSpeed = convertBytes(stats.upSpeed);
        stats.downLimit = convertBytes(stats.downLimit);
        stats.upLimit = convertBytes(stats.upLimit);

        // Add stats to scope
        $scope.stats = stats;

        if (!$scope.changingThrottleSpeeds) {
            if (stats.downLimit.endsWith("MB")) {
                $scope.downLimitMb = stats.downLimit.substring(0, stats.downLimit.indexOf('.'));
                $scope.downLimitKb = stats.downLimit.substring(stats.downLimit.indexOf('.')+1, stats.downLimit.indexOf('.')+2)*100;
            }
            else if (stats.downLimit.endsWith("kB")) {
                $scope.downLimitMb = 0;
                $scope.downLimitKb = stats.downLimit.substring(0, stats.downLimit.indexOf('.'));
            }
        }
    });
}


/**
 * A helper function to push the current download speed (obtained by the 'getGlobalStats' function)
 * into an array where it will be used by our charting library
 * @param $scope The app scope
 * @param speed {string} The download speed
 */
function pushDownloadSpeed($scope, speed) {
    // Convert speed to kB
    speed = speed/1024;

    // Ignore tiny speed amounts - keeps graph standardised
    if (speed < 1) {
        speed = 0;
    }

    // Remove first entry in array - oldest data
    $scope.downloadData[0] = $scope.downloadData[0].slice(1);

    // Add new speed to array
    $scope.downloadData[0].push([counter++, speed]);
}


/**
 * A helper function to push the current upload speed (obtained by the 'getGlobalStats' function)
 * into an array where it will be used by our charting library
 * @param $scope The app scope
 * @param speed {string} The upload speed
 */
function pushUploadSpeed($scope, speed) {
    // Convert speed to kB
    speed = speed/1024;

    // Ignore tiny speed amounts - keeps graph standardised
    if (speed < 1) {
        speed = 0;
    }

    // Remove first entry in array - oldest data
    $scope.uploadData[0] = $scope.uploadData[0].slice(1);

    // Add new speed to array
    $scope.uploadData[0].push([counter++, speed]);
}



function secondsToTime(seconds) {
    var sec_num = parseInt(seconds, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;

    if (isNaN(hours)) {
        return "Infinity";
    }
    return time;
}