
var app = angular.module('killws', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'template/search.html'
        })
})

app.controller('viewController', function($scope, db, checkResult, isShow){
    $scope.$on('storeData', function(){
        if(!checkResult.recordAbility) return;

        db.store(checkResult.title);
    })
//加载动画
    $scope.cover = isShow;
})

app.controller('fetchData', function($scope, $http, $timeout, dataShow, dataFormatt, isShow){

    $scope.dataShow = dataShow;

//    关闭加载动画
    isShow.loadCover = false;

//    请求词义的url（jsonp）
    var url='http://fanyi.youdao.com/openapi.do?keyfrom=Kill-Words&key=679618694&type=data&doctype=jsonp&callback=JSON_CALLBACK&version=1.1&q=';

    $scope.check = function(){

//        不能输入一个字母就查一次……这对后面记录查询历史的功能实现造成困难
        if($scope.timeoutID)
            $timeout.cancel($scope.timeoutID);

        $scope.timeoutID = $timeout(function(){
            //        显示加载字样
            dataShow.loaded = false;
            var q = $scope.query,
                oldurl = url;
            if(q===' '|| q.length===0) return;

            $http.jsonp(oldurl+q).success(function(data){
                display(data);
                $scope.$emit('storeData');
            });
            $timeout.cancel($scope.timeoutID);
        }, 500);

    }

    $scope.showAbout = function(){
        isShow.conponent = true;
    }

    function display(data){
//        格式化接收到的对象为适合展示的对象
        $scope.data = dataFormatt(data);

        if($scope.data.mode==='w'){
            dataShow.isWord = true;
            $scope.header = {
                mainTitle: '单词释义',
                subTitle: '词义扩展'
            }
        }
        else if($scope.data.mode==='s'){
            $scope.header = {
                mainTitle: '翻译结果'
            }
            dataShow.isWord= false;

//
        }
        dataShow.loaded=true;
    }
});

app.controller('aboutCtrl', function($scope, isShow){
//    简介默认不出现
    $scope.showAbout = isShow;

    $scope.hideAbout = function(){
        isShow.conponent = false;
    }
});

//存储历史数据
app.factory('db', function(){
    var ls = window.localStorage;
    return {
        store: function(str){
//            如果是短语，那只分析第一个单词
            var w = str.split(' ')[0].toString(), key, valueList;

            for(var i=1; i<= w.length; i++){
                key = w.slice(0, i);
                if(!ls.getItem(key))
                    ls.setItem(key, [w]);
                else {
                    valueList = angular.fromJson(ls.getItem(key));
                    valueList.push(w);
                    ls.setItem(key, valueList);
                }
            }

        },
        retrieve: function(key){
            var value = ls.getItem(key);

        }
    }
})

//格式化返回的数据
app.factory('dataFormatt', function(checkResult){
    return function(data){

        checkResult.title = data.query

        if(data.basic){

            checkResult.basic = {};

            var explains = checkResult.basic.explains = [];
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
                checkResult.basic.pronounce = data.basic.phonetic;
            else
                checkResult.basic.pronounce = '暂无发音';

            if(data.web){
                checkResult.web = data.web;
            }
            checkResult.mode = 'w';
//            单词模式都是可记录的
            checkResult.recordAbility = true;
        }
        else if(data.translation){
            checkResult.translation = data.translation[0];

            //        判断是否该记录词条
            if(checkResult.title === checkResult.translation)

                checkResult.recordAbility = false;
            else
                checkResult.recordAbility = true;

            checkResult.mode = 's';
        }

        return checkResult;
    }
});

//决定内容是否出现的service
app.value('isShow', {
    conponent: false,
    loadCover: true
});

//fetchData配置
app.value('dataShow', {
    loaded: false,
    isWord: false
});

//查询结果对象
app.value('checkResult', {});
