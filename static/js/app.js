
var killws = angular.module('killws', [
    'ngRoute',
    'ngAnimate',
    'controllers',
    'services',
    'filters'
]);

killws.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'template/search.html'
        })
})
