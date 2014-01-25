var app = angular.module('myApp', ['ui.bootstrap', 'ngRoute']);
var counter = 150; // Counter needed for flot chart


app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/main/:torrentHash', {
            templateUrl: 'partials/detailed_info',
            controller: 'DetailedInfoCtrl'
        }).
        when('/main', {
            templateUrl: 'partials/torrents'
        }).
        otherwise({
            redirectTo: '/main'
        });
}]);


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
    $scope.jstree = {children:[]}

    // This is needed for selecting tabs from the overview widget
    $scope.tab = {
        overviewTab:false,
        allTab:false,
        seedingTab:false,
        leechingTab:false,
        currUpTab:false,
        currDownTab:false
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
});


app.controller('DetailedInfoCtrl', function DetailedInfoCtrl($scope, $http) {
    getDetailedInfo($scope, $http);

    $scope.fileSelected = {};
});


function getDetailedInfo($scope, $http) {
    // Parse URL
    var url = document.location.href.toString();
    var hash = url.substring(url.lastIndexOf('/'), url.length);

    $http.get(document.location.origin + '/torrents' + hash).success(function(detailedInfo) {
        $scope.fileData = detailedInfo;
    });

    $http.get(document.location.origin + '/trackers' + hash).success(function(detailedInfo) {
        $scope.trackerInfo = detailedInfo;
    });

    $http.get(document.location.origin + '/info' + hash).success(function(detailedInfo) {
        $scope.torrentInfo = detailedInfo;
    });

    $http.get(document.location.origin + '/peers' + hash).success(function(detailedInfo) {
        $scope.peerInfo = detailedInfo;
    });
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


function getSystemStats($scope, $http) {
    $http.get(document.location.origin + '/system-stats').success(function(systemInfo) {
        systemInfo.totalSpaceNormalized = convert(systemInfo.totalDisk);
        systemInfo.freeSpaceNormalized = convert(systemInfo.freeDisk);
        $scope.systemInfo = systemInfo;
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
        stats.downSpeed = convert(stats.downSpeed);
        stats.upSpeed = convert(stats.upSpeed);
        stats.downLimit = convert(stats.downLimit);
        stats.upLimit = convert(stats.upLimit);

        // Add stats to scope
        $scope.stats = stats;
    });
}


/**
 * An Angular directive that plots a 'flot' chart
 */
app.directive('chart', function() {
    return {
        restrict: 'E',
        template: '<div style="height:300px;"></div>',
        replace: true,
        link: function(scope, elem, attrs) {

            var chart = null,
                opts  = {
                    series: { shadowSize: 0 }, // drawing is faster without shadows
                    lines: {fill: true},
                    grid: {borderWidth:0 },
                    //yaxis: { min: 0, max: 100 },
                    colors: ["#ff2424"],
                    xaxis: {show: false},
                    yaxis: {min: 0, show: true}
                };

            scope.$watch(attrs.ngModel, function(v) {
                if (!chart) {
                    chart = $.plot(elem, v , opts);
                    elem.show();
                }
                else {
                    chart.setData(v);
                    chart.setupGrid();
                    chart.draw();
                }
            }, true);
        }
    };
});


/**
 *
 * @param $scope
 * @param speed
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
 *
 * @param $scope
 * @param speed
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



//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
    var objects = [];

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) {
            continue;
        }
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        }
        else {
            if (i == key && obj[i] == val || i == key && val == '') {
                objects.push(obj);
            }
            else if (obj[i] == val && key == '') {
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
    }
    return objects;
}


app.directive('jstree', function() {
    return {
        restrict: 'A',

        link: function(scope, element, attrs) {

            scope.$watch(attrs.data, function(v) {

                if (v === undefined) {
                    return;
                }

                $(element).jstree({
                    'core': {
                        "data": v.children,
                        "themes": {
                            "dots": false,
                            "responsive": true
                        }
                    },
                    "plugins": ["sort", "themes"]
                }, false).bind("select_node.jstree", function (event, data) {
                        scope.fileSelected = getObjects(v, '', data.node.text)[0];
                        scope.$digest();
                        //console.log(scope.fileSelected)
                        //alert("lol")
                    });
            });
        }
    };
});