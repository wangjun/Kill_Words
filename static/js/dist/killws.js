
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

var controllers = angular.module('controllers', []);

controllers.controller('viewController', function($scope, db, checkResult, isShow){
    $scope.$on('storeData', function(){
        if(!checkResult.recordAbility) return;
        db.store(checkResult.title);
    })
//    加载动画
    $scope.cover = isShow;
})

controllers.controller('fetchData', function($scope, $http, $timeout, dataShow, dataFormatt, isShow, db){
    $scope.dataShow = dataShow;
    $scope.isShow = isShow;
    $scope.$on('change', function(){
        $scope.check();
    })
//    关闭加载动画
    isShow.loadCover = false;
//    请求词义的url（jsonp）
    var url='http://fanyi.youdao.com/openapi.do?keyfrom=Kill-Words&key=679618694&type=data&doctype=jsonp&callback=JSON_CALLBACK&version=1.1&q=';

    $scope.check = function(){
//        获取查询历史，辅助查词
        $scope.history = db.retrieve($scope.query);
        $scope.history ? isShow.historyList=true : isShow.historyList=false;
//        不能输入一个字母就查一次……这对后面记录查询历史的功能实现造成困难
        if($scope.timeoutID) $timeout.cancel($scope.timeoutID);
        $scope.timeoutID = $timeout(function(){
            //        显示加载字样
            dataShow.loaded = false;
            var q = $scope.query,
                oldurl = url;
            if(q===' '|| q.length===0) return;
            $http.jsonp(oldurl+q).success(function(data){
                display(data);
//                避免记录单字母
                if(q.length>1) $scope.$emit('storeData');
            });
            $timeout.cancel($scope.timeoutID);
        }, 500);
    }

    $scope.showAbout = function(){
        isShow.conponent = true;
    }

    $scope.selectByKey = function(e){
        var kc = e.keyCode;
        if(kc!==38&&kc!==40&&kc!==13) return;
//        防止光标移动
        e.preventDefault();
        var $ = angular.element,
            currentTarget = $(e.currentTarget),
        LIs = currentTarget.find('li'),
            input = currentTarget.find('input'),
            activeLI = LIs.filter('.active');
//        去掉旧高亮
        activeLI.removeClass('active');
//        向上选择
        if(kc===38){
            if(activeLI.length===0)
                LIs.eq(-1).addClass('active');
            else{
                var prev = activeLI.prev();
                if(prev) prev.addClass('active');
            }
        }
//        向下选择
        if(kc===40){
            if(activeLI.length===0)
                LIs.eq(0).addClass('active');
            else{
                var next = activeLI.next();
                if(next) next.addClass('active');
            }
        }

        if(kc===13){
//        把高亮条目的值写到输入框内
            $scope.query = activeLI.text();
            $scope.$emit('change');
//            让下拉条消失
            $timeout(function(){isShow.historyList = false;}, 20);
        }
    }

    $scope.selectByCursor = function(e){
        if(e.target.tagName.toLowerCase()!='li') return;
        var $ = angular.element;
//          删除旧高亮
        if($(e.currentTarget).find('li.active'))  $(e.currentTarget).find('li.active').removeClass('active');
        $(e.target).addClass('active');
    }

    $scope.selectByClick = function(e){
        if(e.target.tagName.toLowerCase()!='li') return;

        var $ = angular.element,
            currentTarget = $(e.currentTarget),
            target = $(e.target),
            input = currentTarget.find('input');

        $scope.query = target.text();
        $scope.$emit('change');
//        延迟执行，避免被覆盖
        $timeout(function(){isShow.historyList = false;}, 20);
    }

    $scope.bookmark = function(e){
        if(e.target.tagName.toLowerCase()!=='span') return;
        var $ = angular.element,
            star = $(e.target);

        if(!star.attr('class')){
            star.addClass('marked');
            $scope.$emit('bookmark');
        }
        else {
            star.removeClass('marked');
            $scope.$emit('delBookMark');
        }
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
        }
        dataShow.loaded=true;
    }
});

controllers.controller('aboutCtrl', function($scope, isShow){
//    简介默认不出现
    $scope.showAbout = isShow;
    $scope.hideAbout = function(){
        isShow.conponent = false;
    }
});
var filters = angular.module('filters', []);


//让历史结果按长度排
filters.filter('sortHistory', function(){
    return function(histArr, reverse){
        for(var i=0; i<histArr.length-1; i++){
            for(var j=0;j<histArr.length-1;j++){
                if(histArr[j].length>histArr[j+1].length){
                    var temp = histArr[j];
                    histArr[j] = histArr[j+1];
                    histArr[j+1]=temp;
                }
            }
        }
        if(reverse) histArr.reverse();
        return histArr;
    }
});

var services = angular.module('services', []);


//存储历史数据
services.factory('db', function(sortHistoryFilter){
    var ls = window.localStorage;
    return {
        store: function(str){
//            如果是短语，那只分析第一个单词
            var w = str.split(' ')[0].toLowerCase(), key, valueList;
            for(var i=1; i<= w.length; i++){
                key = w.slice(0, i);
                if(!ls.getItem(key)){
                    var tempArr = [];
                    tempArr.push(w);
                    tempArr = angular.toJson(tempArr);
                    ls.setItem(key, tempArr);
                }
                else {
                    valueList = angular.fromJson(ls.getItem(key));
//                    如果数组里已存有要存的值，则退出函数
                    if(valueList.indexOf(w)!==-1) return;

                    valueList.push(w);
                    var valueList = angular.toJson(valueList);
                    ls.setItem(key, valueList);
                }
            }
        },
        retrieve: function(str){
            var key = str.split(' ')[0].toLowerCase(),
                value = ls.getItem(key);
            value = angular.fromJson(value);
            console.log(value);
            if(!value) return null;
            else value = sortHistoryFilter(value);
            return value;
        }
    }
})

//格式化返回的数据
services.factory('dataFormatt', function(checkResult){
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
            if(checkResult.title.toLowerCase() === checkResult.translation)
                checkResult.recordAbility = false;
            else
                checkResult.recordAbility = true;
            checkResult.mode = 's';
        }
        return checkResult;
    }
});

//决定内容是否出现的service
services.value('isShow', {
    conponent: false,
    loadCover: true,
    historyList: false
});

//fetchData配置
services.value('dataShow', {
    loaded: false,
    isWord: false
});

//查询结果对象
services.value('checkResult', {});
