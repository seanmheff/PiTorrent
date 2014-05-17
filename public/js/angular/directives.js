/**
 * This module contains our angular directives
 * We define the module and inject its dependencies
 */
var app = angular.module('myApp.directives', []);


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
 * An Angular directive that changes a jQuery knob colour to green if the knobs value is 100
 */
app.directive('getcolour', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if (scope.knob == 100) {
                element.attr("data-fgColor", "#66CC66");
            }
        }
    };
});
