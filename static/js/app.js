var app = angular.module('killws', ['ngRoute']);

app.controller('viewController', function(){

})

app.controller('fetchData', function($scope, $http, $timeout, dataFormatt){

    $scope.loaded = false;
    $scope.isWord = false;

//    请求词义的url（jsonp）
    var url='http://fanyi.youdao.com/openapi.do?keyfrom=Kill-Words&key=679618694&type=data&doctype=jsonp&callback=JSON_CALLBACK&version=1.1&q=';

    $scope.check = function(){

//        显示加载字样
        $scope.loaded = false;
        var q = $scope.query,
            oldurl = url;
        if(q===' '|| q.length===0) return;

        $http.jsonp(oldurl+q).success(function(data){
            display(data);
        });
    }


    function display(data){
//        格式化接收到的对象为适合展示的对象
        $scope.data = dataFormatt(data);

        if($scope.data.mode==='w'){
            $scope.isWord = true;
            $scope.header = {
                mainTitle: '单词释义',
                subTitle: '词义扩展'
            }
        }
        else if($scope.data.mode==='s'){
            $scope.header = {
                mainTitle: '翻译结果'
            }
            $scope.isWord= false;
        }
        $scope.loaded=true;
    }
});

app.controller('about', function(){

});

//route
app.config(function($locationProvider, $routeProvider){
    $routeProvider.when('/about', {
        controller: 'about',
        templateUrl: 'template/about.html'
    });
    $locationProvider.html5Mode(true);
})

app.factory('dataFormatt', function(){
    return function(data){
        var output={
            title: data.query
        };
        if(data.basic){

            output.basic = {};

            var explains = output.basic.explains = [];
            angular.forEach(data.basic.explains, function(value){
                var temp = {};

//                当中译英的时候，这里有可能会没有词类前缀
                temp.type = value.match(/\b[a-z]+\./);

                if(temp.type != null){
                    temp.type = temp.type.toString();
                    temp.content = value.slice(temp.type.length, -1);
                }
                else
                    temp.content = value;

                explains.push(temp);
            })
//            中译英有的没有拼音注音
            if(data.basic.phonetic)
                output.basic.pronounce = data.basic.phonetic;
            else
                output.basic.pronounce = '暂无发音';

            if(data.web){
                output.web = data.web;
            }
            output.mode = 'w';
        }
        else if(data.translation){
            output.translation = data.translation[0];
            output.mode = 's';
        }
        return output;
    }

})