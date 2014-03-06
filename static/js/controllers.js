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