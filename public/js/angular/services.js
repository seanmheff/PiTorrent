/**
 * This module contains our angular services
 * We define the module and inject its dependencies (if any)
 */
var app = angular.module('myApp.services', []);


/**
 * A service to share a torrent name between controllers
 */
app.service('sharedTorrentName', function() {
    var property = '';

    this.getName = function () {
        return property;
    };

    this.setName = function(name) {
        property = name;
    };
});