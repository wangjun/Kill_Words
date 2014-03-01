var app = angular.module('killws', ['ngRoute', 'ngAnimate']);

app.controller('viewController', function($scope){

})

app.controller('fetchData', function($scope, $http, dataFormatt, isAboutShow){

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

    $scope.showAbout = function(){
        isAboutShow.conponent = true;
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

app.controller('aboutCtrl', function($scope, isAboutShow){
//    简介默认不出现
    $scope.showAbout = isAboutShow;

    $scope.hideAbout = function(){
        isAboutShow.conponent = false;
    }
});

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

//决定简介内容是否出现的service
app.value('isAboutShow', {
    conponent: false
});

