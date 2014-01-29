/**
 * Define our angular app and its dependencies
 */
var app = angular.module('myApp', [
    'ui.bootstrap',
    'ngRoute',
    'myApp.filters',
    'myApp.directives',
    'myApp.controllers',
    'myApp.services'
]);


/**
 * Define our angular routes - i.e. what content is rendered depending on the URL
 */
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