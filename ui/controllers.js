/* @author: Maslax Ali
 * @Date: 10/06/2020
 *
**/

var app = angular.module("immuta.homework.controllers", []);

// Use a service to inject shared variables
app.service('sharedProperties', function () {
    var data = {};
    var isLoaded = false;
    return {
        getProperty: function () {
            return data;
        },
        setProperty: function (value) {
            data = value;
        },
        getLoading: function () {
            return isLoaded;
        },
        setLoading: function (value) {
            isLoaded = value;
        }
    };
});

// Main controller for Map
app.controller('MapController', ['$scope', '$http', '$rootScope', '$timeout', 'sharedProperties', function ($scope, $http, $rootScope, $timeout, sharedProperties) {
    // Fetch the data as soon as MapController initializes
    this.$onInit = function () {
        $scope.markers = {};
        $http.get('/data?year=2015').then(function mySuccess(response) {
            //share recieved data
            sharedProperties.setProperty(response.data);
            sharedProperties.setLoading(true);
            $scope.markLocations(sharedProperties.getProperty(), 3, 0);
            return response;
        }, function myError(response) {
            console.log("ERROR");
        });
    }

    var timeout;
    // function used to query nominatim with a 1 second delay
    $scope.markLocations = function (data, count, index) {
        $http.get('/nominatim?zipcode=' + data[index].vendor_zip).then(function mySuccess(response) {
            // If zipcode is not found, skip.
            if (response.data.lat == undefined) {
                $scope.markLocations(data, count, index + 1);
                return response;
            }
            // Make the markers on the map
            $scope.markers["m" + index] = {
                lat: parseFloat(response.data.lat),
                lng: parseFloat(response.data.lon),
                message: "Zipcode: " + data[index].vendor_zip + "\n Total: " + data[index].amount,
                icon: {
                    iconUrl: 'assets/icons/icon.png',
                    iconSize: [40, 40], // size of the icon
                    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                }
            };
            return response;
        }, function myError(response) {
            console.log("ERROR");
        });
        timeout = $timeout(function () {
            if (count > 1) {
                $scope.markLocations(data, count - 1, index + 1);
            }
            else {
                $timeout.cancel(timeout);
            } //  ..  setTimeout()
        }, 1000);
    }

    // Center our map around maryland
    angular.extend($scope, {
        maryland: {
            lat: 39.2908816,
            lng: -76.610759,
            zoom: 9
        },
        markers: {}
    });

    // Global function to call MarkLocations outside of controller
    $rootScope.$on("CallMarkLocations", function (event, args) {
        //cancel our timeout and reset markers
        $scope.markers = {};
        $timeout.cancel(timeout);
        $scope.markLocations(sharedProperties.getProperty(), args.count, 0);
    });

}]);

// Slider Controller
app.controller('SliderController', ['$scope', '$rootScope', 'sharedProperties', function ($scope, $rootScope, sharedProperties) {
    $scope.levelvalue = 3;
    $scope.max = 100;
    $scope.isDisabled = true;
    // watch our data for change
    $scope.$watch(function () { return sharedProperties.getProperty(); }, function (newVal) {
        $scope.max = Object.keys(newVal).length;
        // fixes bug of moving slider before length of our data is returned
        if (Object.keys(newVal).length > 1) {
            $scope.isDisabled = false;
        }
    }, true);

    $scope.makeCall = function () {
        $rootScope.$emit("CallMarkLocations", { count: $scope.levelvalue });
    };

}]);

//Table Controller
app.controller('TableController', ['$scope', 'sharedProperties', function ($scope, sharedProperties) {
    $scope.dataTable = {};
    // Watch our data to fill the table
    $scope.$watch(function () { return sharedProperties.getProperty(); }, function (newVal) {
        $scope.dataTable = newVal;
    }, true);
}]);