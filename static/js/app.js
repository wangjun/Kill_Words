
var killws = angular.module('killws', [
    'ngRoute',
    'ngAnimate',
    'controllers',
    'services',
    'filters'
]);

killws.config(function($routeProvider){
    $routeProvider
        .when('/search', {
            templateUrl: 'template/search.html'
        })
        .when('/about', {
            templateUrl: 'template/about.html'
        })
        .otherwise({
            redirectTo: '/search'
        })
})
