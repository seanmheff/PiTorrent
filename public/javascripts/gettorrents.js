/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:16
 * To change this template use File | Settings | File Templates.
 */

function TorrentCtrl($scope, $http) {
    getTorrents($scope, $http);

    setInterval(function(){
        getTorrents($scope, $http);
    },2000);
}

function getTorrents($scope, $http) {
    $http.get('http://localhost:3000/torrents').success(function(torrents) {
	//if (torrents.toString().indexOf("There was a problem connecting to rtorrent") == 0) {
	//    $scope.torrentResults = null;
	//}

        for (var x in torrents.torrents) {
            torrents.torrents[x]['percentDone'] = (torrents.torrents[x]['downloaded'] / torrents.torrents[x]['size'] * 100).toFixed(1);
            torrents.torrents[x]['size'] = convert(torrents.torrents[x]['size']);
            torrents.torrents[x]['uploadRate'] = convert(torrents.torrents[x]['uploadRate']);
            torrents.torrents[x]['downloadRate'] = convert(torrents.torrents[x]['downloadRate']);
            torrents.torrents[x]['downloaded'] = convert(torrents.torrents[x]['downloaded']);
        }
        $scope.torrentResults = torrents;
    });
}


function convert(fileSizeInBytes) {

    if (fileSizeInBytes == 0) {
        return "0.0 kB";
    }

    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}
