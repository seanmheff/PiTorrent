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
            templateUrl: 'partials/detailed_info_widgets/overview',
            controller: 'DetailedOverviewCtrl'
        }).
        when('/main/:torrentHash/peers', {
            templateUrl: 'partials/detailed_info_widgets/peers',
            controller: 'DetailedPeerCtrl'
        }).
        when('/main/:torrentHash/files', {
            templateUrl: 'partials/detailed_info_widgets/files',
            controller: 'DetailedFileCtrl'
        }).
        when('/main', {
            templateUrl: 'partials/torrents'
        }).
        when('/settings', {
            templateUrl: 'partials/settings',
            controller: 'SettingsCtrl'
        }).
        otherwise({
            redirectTo: '/main'
        });
}]);