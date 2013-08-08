/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 08/08/13
 * Time: 20:16
 * To change this template use File | Settings | File Templates.
 */

angular.module("Torrent", ["ngResource"]);

function TorrentCtrl($scope, $resource) {
    setInterval(function(){
        $scope.torrents = $resource("http://localhost\\:3000/torrents");
        $scope.torrentResults = $scope.torrents.get();
    }, 2000);
}
