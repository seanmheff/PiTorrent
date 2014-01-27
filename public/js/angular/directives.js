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
 * An Angular directive that plots a 'jstree' tree
 */
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
                    });
            });
        }
    };
});


/**
 * A helper function to return an array of objects according to key, value, or key and value matching specific inputs
 * @param obj The object to search through
 * @param key The key to search for
 * @param val The value to search for
 * @returns {Array} An array containing all the matching objects
 */
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