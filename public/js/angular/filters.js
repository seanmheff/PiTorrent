/**
 * This module contains our angular filters
 * We define the module and inject its dependencies
 */
var app = angular.module('myApp.filters', [])


/**
 * An Angular filter function to determine if a torrent is stopped
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is stopped
 */
app.stoppedFilter = function(torrent) {
    return torrent.active == 0;
};


/**
 * An Angular filter function to determine if a torrent is started
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is started
 */
app.startedFilter = function(torrent) {
    return torrent.active == 1;
};


/**
 * An Angular filter function to determine if a torrent is seeding
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is seeding
 */
app.seedingFilter = function(torrent) {
    return torrent.complete == 1;
};


/**
 * An Angular filter function to determine if a torrent is leeching
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is leeching
 */
app.leechingFilter = function(torrent) {
    return torrent.complete == 0;
};


/**
 * An Angular filter function to determine if a torrent is currently currently uploading
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is currently uploading
 */
app.uploadingFilter = function(torrent) {
    return torrent.uploadRate > 0;
};


/**
 * An Angular filter function to determine if a torrent is currently currently downloading
 * @param torrent The torrent to evaluate
 * @returns {boolean} Returns a boolean to denote if the torrent is currently downloading
 */
app.downloadingFilter = function(torrent) {
    return torrent.downloadRate > 0;
};