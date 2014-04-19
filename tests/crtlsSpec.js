'use strict';

describe('controllers', function(){

    var scope, ctrl, dog;
    beforeEach(module('killws'));
    beforeEach(module('controllers'));
    beforeEach(module('services'));

    beforeEach(inject(function($rootScope){
        scope = $rootScope.$new();
    }))

    it('test data fetching', inject(function($controller, $httpBackend, $timeout, $http){
        ctrl = $controller('fetchData', {$scope: scope});
        var url = 'http://fanyi.youdao.com/openapi.do?keyfrom=Kill-Words&key=679618694&type=data&doctype=jsonp&callback=JSON_CALLBACK&version=1.1&q=';
        $httpBackend.expect('GET', url+'shit').respond({
            base: 'A kind of solid with very soft surface and unique smell.',
            isWord: true,
            isLoaded: false
        });
        scope.query = 'shit';
        //TODO: Change get function to json.
        $http.get(url+scope.query);
        $httpBackend.flush();
    }))
})